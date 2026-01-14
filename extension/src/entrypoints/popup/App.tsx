import { storage } from "#imports";
import {
  openInfoPage,
  playLocalAudio,
  postMessage,
  setLocalVolume,
  stopLocalAudio,
} from "@/utils";
import { getSounds } from "@/utils/api";
import { CrossFunctions } from "@/utils/constants";
import { isSoundCached, retrieveSound, storeSound } from "@/utils/db.ts";
import { useEffect, useState } from "react";
import "./App.css";

import {
  BoxIcon,
  CheckIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  EnterIcon,
  ExitIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  QuestionMarkCircledIcon,
  GearIcon,
  SpeakerLoudIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import fuzzysort from "fuzzysort";
import { DropdownMenu, Separator, Slider, Tooltip } from "radix-ui";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "../../icons";

function App() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isMeet, setIsMeet] = useState<boolean>(false);
  const [soundButtons, setSoundButtons] = useState<any[]>([]);
  const [folders, setFolders] = useState<{ name: string; slug: string }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hideMeetIcon, setHideMeetIcon] = useState(false);
  const [hideMuteButton, setHideMuteButton] = useState(false);

  const [folderSelectWidth, setFolderSelectWidth] = useState(0);

  const [fxVolume, setFxVolume] = useState(25);
  const [micMuted, setMicMuted] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [user, setUser] = useState<User>(null);

  const fxVolumeStorage = storage.defineItem<number>("local:fxVolume", {
    fallback: 25,
  });
  const micMutedStorage = storage.defineItem<boolean>("session:micMuted", {
    fallback: false,
  });
  const selectedFolderStorage = storage.defineItem<string>(
    "local:selectedFolder",
    {
      fallback: "favorites",
    }
  );

  let loaded = false;
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    async function startLogin() {
      const token = (await storage.getItem("local:jwt")) ?? null;
      if (token) {
        setUser(await login(token as string));
      }
      fetchSounds();
    }

    startLogin();
  }, []);

  async function fetchSounds() {
    setIsSyncing(true);
    try {
      const response = await getSounds();
      const sounds = await Promise.all(
        response.data.map(async (sound: any) => {
          const id = sound.id;
          const { name, color, emoji, folders, audio_file_url } =
            sound.attributes;
          const fullUrl = `${API_URL}${audio_file_url}`;

          const isCached = await isSoundCached(id);
          if (!isCached) {
            const audioResponse = await fetch(fullUrl);
            const blob = await audioResponse.blob();
            await storeSound(id, blob);
          } else {
          }

          return {
            id: id,
            label: name,
            color: color || "gray",
            emoji: emoji || "🎵",
            folders: folders || [],
          };
        })
      );

      // finds all folders that have sounds in them
      const usedFolders: { name: string; slug: string }[] = [];
      sounds.forEach((sound: any) => {
        sound.folders.forEach((folder: any) => {
          if (!usedFolders.some((f: any) => f.slug === folder.slug)) {
            usedFolders.push(folder);
          }
        });
      });

      setFolders(usedFolders);
      setSoundButtons(sounds);
      setIsSyncing(false);
    } catch (err) {
      console.error("Failed to fetch sounds:", err);
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // encodes to base64
    });
  }

  function updateFxVolume(volume: number) {
    setFxVolume(volume);
    fxVolumeStorage.setValue(volume);
    setLocalVolume(volume);
    if (isMeet) {
      postMessage(CrossFunctions.SET_VOLUME, {
        volume: fxVolume,
      });
    }
  }

  async function playSound(id: number) {
    const blob = await retrieveSound(id);
    const base64 = await blobToBase64(blob);
    if (isMeet) {
      postMessage(CrossFunctions.INJECT_AUDIO, {
        base64: base64,
        volume: fxVolume,
      });
    }
    const success = await playLocalAudio(base64, fxVolume);
    if (success) {
      browser.runtime.sendMessage({
        type: CrossFunctions.SET_AUDIO_PLAYING,
        audioID: id,
      });
      setCurrentlyPlaying(id);
    }
  }

  async function stopSound() {
    if (isMeet) {
      postMessage(CrossFunctions.STOP_AUDIO);
    }
    stopLocalAudio();
    setCurrentlyPlaying(null);
  }

  async function handleMicMute(muteMic: boolean) {
    micMutedStorage.setValue(muteMic);
    setMicMuted(muteMic);
    if (isMeet) {
      let message = muteMic ? CrossFunctions.MUTE_MICROPHONE : CrossFunctions.UNMUTE_MICROPHONE;
      const tabs = await browser.tabs.query({ url: "https://meet.google.com/*" });
      tabs.forEach(tab => {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, {
            type: message
          });
        }
      });
    }
  }

  function sortAndFilter() {
    let outputSounds = soundButtons.sort((a: any, b: any) => a.id - b.id);

    if (selectedFolder !== "") {
      outputSounds = soundButtons.filter((sound) =>
        sound.folders.some((folder: any) => folder.slug === selectedFolder)
      );
    } else {
      outputSounds = soundButtons;
    }

    if (searchInput !== "") {
      outputSounds = fuzzysort
        .go(searchInput, outputSounds, { key: "label" })
        .map((result) => result.obj);
    }

    return outputSounds;
  }

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? "";
      setIsMeet(url.startsWith("https://meet.google.com"));
    });
  }, []);

  useEffect(() => {
    async function loadStates() {
      setFxVolume(await fxVolumeStorage.getValue());
      setMicMuted(await micMutedStorage.getValue());
      setSelectedFolder(await selectedFolderStorage.getValue());
      setCurrentlyPlaying(
        await browser.runtime.sendMessage({
          type: CrossFunctions.GET_AUDIO_PLAYING,
        })
      );
    }
    loadStates();
  }, []);

  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === CrossFunctions.AUDIO_ENDED) {
        setCurrentlyPlaying(null);
      }
    };

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    fetchSounds();
  }, []);

  function handleSync() {
    fetchSounds();
  }

  useEffect(() => {
    // Resize the folder selector on value change
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `12px 'Instrument Sans', sans-serif`;
      const selectedFolderText =
        selectedFolder === ""
          ? "All Sounds"
          : folders.find((folder) => folder.slug === selectedFolder)?.name ??
            "All Sounds";
      const textWidth = context.measureText(selectedFolderText).width;
      setFolderSelectWidth(textWidth + 48);
    }
  }, [selectedFolder]);

  const [soundButtonOverflow, setSoundButtonOverflow] = useState("");

  useEffect(() => {
    // Since the height isn't calculated correctly when it loads, this forces it to recalculate
    const forceReflow = () => {
      const body = document.body;
      const originalOverflow = body.style.overflow;
      body.style.overflow = "hidden";
      body.offsetHeight;
      body.style.overflow = originalOverflow;
    };

    setTimeout(() => {
      setSoundButtonOverflow("auto");
    }, 10);
    setTimeout(() => {
      forceReflow();
    }, 20);
  }, []);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      // Disable playing and pausing with media keys
      navigator.mediaSession.setActionHandler("play", () => {});
      navigator.mediaSession.setActionHandler("pause", () => {});
    }
  }, []);

  useEffect(() => {
    // If the selected folder is deleted
    if (!folders.some((folder) => folder.slug === selectedFolder)) {
      setSelectedFolder("");
      selectedFolderStorage.setValue("");
    }
  }, [folders]);

  useEffect(() => {
    async function loadSettings() {
      const value = await storage.getItem("local:hideMeetIcon");
      if (typeof value === 'boolean') {
        setHideMeetIcon(value);
      } else {
        setHideMeetIcon(false);
      }
      const muteValue = await storage.getItem("local:hideMuteButton");
      if (typeof muteValue === 'boolean') {
        setHideMuteButton(muteValue);
      } else {
        setHideMuteButton(false);
      }
    }
    loadSettings();
  }, []);

  async function handleHideMeetIconChange(checked: boolean) {
    setHideMeetIcon(checked);
    await storage.setItem("local:hideMeetIcon", checked);

    const tabs = await browser.tabs.query({ url: "https://meet.google.com/*" });
    tabs.forEach(tab => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, {
          type: CrossFunctions.TOGGLE_MEET_ICON,
          hide: checked,
        });
      }
    });
  }

  async function handleHideMuteButtonChange(checked: boolean) {
    setHideMuteButton(checked);
    await storage.setItem("local:hideMuteButton", checked);

    const tabs = await browser.tabs.query({ url: "https://meet.google.com/*" });
    tabs.forEach(tab => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, {
          type: CrossFunctions.TOGGLE_MUTE_BUTTON,
          hide: checked,
        });
      }
    });
  }

  return (
    <>
      <div className="wrapper">
        <div
          className="topBar"
          style={{
            backgroundImage: `url(${browser.runtime.getURL(
              "/images/bannerBackground.png"
            )})`,
          }}
        >
          <div className="logoContainer">
            <button
              className="logoButton"
              tabIndex={-1}
              onClick={() =>
                browser.tabs.create({ url: import.meta.env.VITE_WEBSITE_URL })
              }
            >
              <img
                src={browser.runtime.getURL("/images/parakeetLogo.png")}
                className="logo"
              />
            </button>
            <h1>Parakeet</h1>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="topBarMenuButton">
                <DotsHorizontalIcon className="topBarMenuButtonIcon" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="bottom"
                sideOffset={2}
                collisionPadding={8}
                className="topBarMenuContent"
              >
                {user ? (
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="topBarMenuItem">
                      <PersonIcon className="topBarMenuItemIcon" />
                      {user.username}
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="topBarSubMenu"
                        sideOffset={8}
                        alignOffset={-2}
                      >
                        <DropdownMenu.Item
                          className="topBarMenuItem topBarMenuItemLogOut"
                          onSelect={() =>
                            browser.tabs.create({
                              url: `${import.meta.env.VITE_WEBSITE_URL}/logout`,
                            })
                          }
                        >
                          Log Out
                          <ChevronRightIcon className="topBarMenuItemIcon topBarMenuItemIconRight" />
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>
                ) : (
                  <DropdownMenu.Item
                    className="topBarMenuItem"
                    onSelect={() =>
                      browser.tabs.create({
                        url: `${import.meta.env.VITE_WEBSITE_URL}/login`,
                      })
                    }
                  >
                    <PersonIcon className="topBarMenuItemIcon" />
                    Log In
                  </DropdownMenu.Item>
                )}
                {user && (
                  <DropdownMenu.Item
                    className="topBarMenuItem"
                    onSelect={handleSync}
                  >
                    <UpdateIcon className="topBarMenuItemIcon" />
                    Sync
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={() =>
                    browser.tabs.create({
                      url: import.meta.env.VITE_WEBSITE_URL,
                    })
                  }
                >
                  <ExternalLinkIcon className="topBarMenuItemIcon" />
                  Website
                </DropdownMenu.Item>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className="topBarMenuItem">
                    <GearIcon className="topBarMenuItemIcon" />
                    Settings
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="topBarSubSettingsMenu"
                      sideOffset={8}
                      alignOffset={-2}
                    >
                      <DropdownMenu.CheckboxItem
                        className="topBarSettingsCheckbox"
                        checked={hideMeetIcon}
                        onCheckedChange={handleHideMeetIconChange}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="topBarMenuItemIndicator">
                          {hideMeetIcon && <CheckIcon />}
                        </div>
                        Hide Google Meet Icon
                      </DropdownMenu.CheckboxItem>
                      <DropdownMenu.CheckboxItem
                        className="topBarSettingsCheckbox"
                        checked={hideMuteButton}
                        onCheckedChange={handleHideMuteButtonChange}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="topBarMenuItemIndicator">
                          {hideMuteButton && <CheckIcon />}
                        </div>
                        Hide Mute Button
                      </DropdownMenu.CheckboxItem>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={() => openInfoPage()}
                >
                  <QuestionMarkCircledIcon className="topBarMenuItemIcon" />
                  Help
                </DropdownMenu.Item>
                <DropdownMenu.Arrow className="topBarMenuArrow" />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        <div className="controlPanel">
          <div className="controlPanelContainer">
            <h2>Sound Effects</h2>
            <div className="soundControls">
              <div className="volumeSliderWrapper">
                <SpeakerLoudIcon className="volumeSliderIcon" />
                <Slider.Root
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="volumeSlider"
                  value={[fxVolume]}
                  onValueChange={(value) => {
                    updateFxVolume(value[0]);
                  }}
                >
                  <Slider.Track className="volumeSliderTrack">
                    <Slider.Range className="volumeSliderRange" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="volumeSliderThumb"
                    aria-label="Volume"
                  />
                </Slider.Root>
              </div>
              <button
                className="iconButton stopButton"
                onClick={stopSound}
                disabled={currentlyPlaying === null}
              >
                <BoxIcon className="buttonIcon stopButtonIcon" />
              </button>
            </div>
          </div>
          <Separator.Root
            className="verticalSeperator"
            decorative
            orientation="vertical"
          />
          <div className="controlPanelContainer">
            <h2 className="voiceLabel">
              Mute{" "}
              <Tooltip.Provider delayDuration={200}>
                <Tooltip.Root>
                  <Tooltip.Trigger
                    asChild
                    onClick={(event) => event.preventDefault()}
                  >
                    <button className="iconButton infoButton">
                      <InfoCircledIcon className="infoButtonIcon" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="infoButtonPopover"
                      side="top"
                      sideOffset={2}
                      collisionPadding={8}
                      onClick={(event) => event.preventDefault()}
                    >
                      <p>
                        Parakeet can only play sound effects when your Google Meet microphone is unmuted. To mute your voice, use this button!
                      </p>
                      <Tooltip.Arrow className="infoButtonArrow" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </h2>
            <button
              className={
                "iconButton" + (micMuted ? " unmuteButton" : " muteButton")
              }
              onClick={(e) => handleMicMute(!micMuted)}
            >
              {micMuted ? (
                <MicOffIcon
                  className="buttonIcon unmuteButtonIcon"
                  viewBox="0 0 27 27"
                  fill="none"
                  stroke="currentColor"
                />
              ) : (
                <MicIcon
                  className="buttonIcon muteButtonIcon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                />
              )}
            </button>
          </div>
        </div>
        <label className="textInputWrapper">
          <MagnifyingGlassIcon className="textInputIcon" />
          <input
            type="text"
            className="textInput"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>

        <div className="folderSelectWrapper">
          <select
            className="folderSelect"
            name="folderSelect"
            value={selectedFolder}
            onChange={(e) => {
              setSelectedFolder(e.target.value);
              // This is not in the useEffect because otherwise it is always overridden to the default
              selectedFolderStorage.setValue(e.target.value);
            }}
            style={{
              width: `${folderSelectWidth}px`,
            }}
          >
            <option value="">All Sounds</option>
            {folders.map((folder) => (
              <option value={folder.slug} key={folder.slug}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div
          className="soundButtonContainer"
          style={{
            overflow: soundButtonOverflow,
            minHeight: soundButtonOverflow ? undefined : "500px",
          }}
        >
          {isSyncing ? (
            <UpdateIcon className="spinIcon spinIconLarge" />
          ) : (
            <>
              {sortAndFilter().map((button) => (
                <SoundButton
                  label={button.label}
                  key={button.id}
                  color={button.color}
                  emoji={button.emoji}
                  onClick={() => playSound(button.id)}
                  isPlaying={currentlyPlaying === button.id}
                />
              ))}
            </>
          )}
        </div>
        <div className="bottomBar">
          <div className="connectedStatusWrapper">
            <h2>Google Meet:</h2>
            <p
              className="connectedStatus"
              style={{
                color: isMeet ? "var(--primary-active)" : "var(--warning)",
              }}
            >
              {isMeet ? (
                <>
                  <VideoIcon
                    className="connectedStatusIcon"
                    fill="none"
                    stroke="currentColor"
                  />
                  Connected
                </>
              ) : (
                <>
                  <VideoOffIcon
                    className="connectedStatusIcon"
                    fill="none"
                    stroke="currentColor"
                  />
                  Disconnected
                </>
              )}
            </p>
          </div>
          <div className="connectedStatusWrapper">
            <p
              className="connectedStatus"
              style={{
                color: user ? "var(--warning)" : "var(--primary-foreground)",
              }}
            >
              {user ? (
                <>
                  <button
                    className="bottomBarButton bottomBarLogout"
                    onClick={() =>
                      browser.tabs.create({
                        url: `${import.meta.env.VITE_WEBSITE_URL}/logout`,
                      })
                    }
                  >
                    <ExitIcon className="connectedStatusIcon" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bottomBarButton bottomBarLogin"
                    onClick={() =>
                      browser.tabs.create({
                        url: `${import.meta.env.VITE_WEBSITE_URL}/login`,
                      })
                    }
                  >
                    <EnterIcon className="connectedStatusIcon" />
                    Log In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
