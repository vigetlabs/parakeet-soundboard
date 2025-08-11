import { useEffect, useState } from "react";
import "./App.css";
import { PublicPath } from "wxt/browser";
import {
  postMessage,
  playLocalAudio,
  stopLocalAudio,
  setLocalVolume,
  openInfoPage,
} from "@/utils";
import { storage } from "#imports";
import { CrossFunctions } from "@/utils/constants";
import { login, getMySounds, getSounds } from "@/utils/api";
import { storeSound, retrieveSound, isSoundCached } from "@/utils/db.ts";

import {
  BoxIcon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircledIcon,
  SpeakerLoudIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { DropdownMenu, Popover, Separator, Slider } from "radix-ui";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "../../icons";
import fuzzysort from "fuzzysort";

function App() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(-1);
  const [searchInput, setSearchInput] = useState("");
  const [isMeet, setIsMeet] = useState<boolean>(false);
  const [soundButtons, setSoundButtons] = useState<any[]>([]);
  const [folders, setFolders] = useState<{ name: string; slug: string }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [folderSelectWidth, setFolderSelectWidth] = useState(0);

  const [fxVolume, setFxVolume] = useState(25);
  const [micMuted, setMicMuted] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchUsername() {
      const result = await browser.storage.local.get("username");
      if (result && result.username) setUsername(result.username);
    }
    fetchUsername();
  }, []);

  const handleTestLogin = async () => {
    console.log("Testing login...");
    try {
      const jwt = await login("natalietest@example.com", "password123");
      console.log("JWT:", jwt);
      const sounds = await getMySounds();
      console.log("My Sounds:", sounds);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  async function fetchSounds() {
    setIsSyncing(true);
    console.log("Fetching sounds...");
    try {
      const response = await getSounds();
      console.log("Default Sounds:", response);
      const sounds = await Promise.all(
        response.data.map(async (sound: any) => {
          const id = sound.id;
          const { name, color, emoji, folders, audio_file_url } =
            sound.attributes;
          const fullUrl = `http://localhost:3001${audio_file_url}`;

          const isCached = await isSoundCached(id);
          if (!isCached) {
            const audioResponse = await fetch(fullUrl);
            const blob = await audioResponse.blob();
            console.log("Caching new sound:", id);
            await storeSound(id, blob);
          } else {
            console.log("Sound already cached:", id);
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
    console.log("Playing sound with id:", id);
    const blob = await retrieveSound(id);
    console.log("(app.tsx)Retrieved sound blob:", blob);
    const base64 = await blobToBase64(blob);
    if (isMeet) {
      postMessage(CrossFunctions.INJECT_AUDIO, {
        base64: base64,
        volume: fxVolume,
      });
    }
    const success = await playLocalAudio(base64, fxVolume);
    if (success) {
      setCurrentlyPlaying(id);
    }
  }

  async function stopSound() {
    if (isMeet) {
      postMessage(CrossFunctions.STOP_AUDIO);
    }
    stopLocalAudio();
    setCurrentlyPlaying(-1);
  }

  async function handleMicMute(muteMic: boolean) {
    micMutedStorage.setValue(muteMic);
    setMicMuted(muteMic);
    if (isMeet) {
      if (muteMic) {
        postMessage(CrossFunctions.MUTE_MICROPHONE);
      } else {
        postMessage(CrossFunctions.UNMUTE_MICROPHONE);
      }
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
    }
    loadStates();
  }, []);

  useEffect(() => {
    // TODO: Make it check if the audio is still playing on reopen
    const listener = (msg: any) => {
      if (msg.type === CrossFunctions.AUDIO_ENDED) {
        setCurrentlyPlaying(-1);
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": ""
         },
        body: JSON.stringify({
          user: { email: loginEmail, password: loginPassword },
        }),
        credentials: "omit"
      });
      const response = await res.json();
      const authHeader = res.headers.get("Authorization");
      let token;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      if (!token) throw new Error("No token received");
      try {
        await browser.storage.local.set({ jwt: token });
      } catch (e) {
        console.error("Failed to store JWT in browser storage:", e);
      }
      console.log("Stored JWT:", token);
      await browser.storage.local.get("jwt").then((result) => {
        console.log("Retrieved JWT:", result.jwt);
      });
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      setUsername(response.status.data.user.username);
      await browser.storage.local.set({ username: response.status.data.user.username });
      alert("Logged in!");
    } catch {
      setLoginError("Login failed");
    }
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
                browser.tabs.create({ url: import.meta.env.VITE_WEBSITE_HOST })
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
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={handleSync}
                >
                  <UpdateIcon className="topBarMenuItemIcon" />
                  Sync
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={() => {
                    browser.tabs.create({
                      url: import.meta.env.VITE_WEBSITE_HOST,
                    });
                  }}
                >
                  <ExternalLinkIcon className="topBarMenuItemIcon" />
                  Settings
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={() => openInfoPage()}
                >
                  <QuestionMarkCircledIcon className="topBarMenuItemIcon" />
                  Help
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={() => setShowLogin(true)}
                >
                  <BoxIcon className="topBarMenuItemIcon" />
                  {username ? `Logged in as ${username}` : "Login"}
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
                disabled={currentlyPlaying === -1}
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
              Voice{" "}
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="iconButton infoButton">
                    <InfoCircledIcon className="infoButtonIcon" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="infoButtonPopover"
                    side="top"
                    sideOffset={2}
                    collisionPadding={8}
                  >
                    <p>
                      This extension can only inject audio when your Google Meet
                      microphone is unmuted. To play sound effects but mute your
                      microphone, use this button!
                    </p>
                    <Popover.Arrow className="infoButtonArrow" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
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
                  key={button.label}
                  color={button.color}
                  emoji={button.emoji}
                  onClick={() => playSound(button.id)}
                  isPlaying={currentlyPlaying === button.id}
                />
              ))}
            </>
          )}
        </div>
        <div className="connectedStatusWrapper">
          <h2>Google Meet Status:</h2>
          <p
            className="connectedStatus"
            style={{ color: isMeet ? "green" : "red" }}
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
      </div>
      {showLogin && (
        <div
          style={{
            position: "fixed",
            top: 100,
            left: 100,
            background: "white",
            zIndex: 9999,
            padding: 24,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <form onSubmit={handleLogin}>
            <h3>Login</h3>
            {loginError && <p style={{ color: "red" }}>{loginError}</p>}
            <input
              type="email"
              placeholder="Email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ display: "block", marginBottom: 8 }}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ display: "block", marginBottom: 8 }}
            />
            <button type="submit">Login</button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              style={{ marginLeft: 8 }}
            >
              Close
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
