import { useState } from "react";
import "./App.css";
import { PublicPath } from "wxt/browser";
import {
  postMessage,
  playLocalAudio,
  stopLocalAudio,
  setLocalVolume,
} from "@/utils";
import { storage } from "#imports";
import { CrossFunctions } from "@/utils/constants";
import { login, getMySounds, getDefaultSounds } from "@/utils/api";
import { storeSound, retrieveSound, isSoundCached } from "@/utils/db.ts";

import {
  BoxIcon,
  DesktopIcon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
  SpeakerLoudIcon,
} from "@radix-ui/react-icons";
import { DropdownMenu, Popover, Separator, Slider } from "radix-ui";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "../../icons";
import fuzzysort from "fuzzysort";

function App() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(-1);
  const [searchInput, setSearchInput] = useState("");
  const [isMeet, setIsMeet] = useState<boolean>(false);
  const [soundButtons, setSoundButtons] = useState<any[]>([]);

  const [folderSelectWidth, setFolderSelectWidth] = useState(0);

  const [fxVolume, setFxVolume] = useState(25);
  const [micMuted, setMicMuted] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("favorites");

  const fxVolumeStorage = storage.defineItem<number>("local:fxVolume", {
    fallback: 25,
  });
  const micMutedStorage = storage.defineItem<boolean>("session:micMuted", {
    fallback: false,
  });
  const selectedFolderStorage = storage.defineItem<string>(
    "session:selectedFolder",
    {
      fallback: "favorites",
    }
  );

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
    console.log("Fetching sounds...");
    try {
      const response = await getDefaultSounds();
      console.log("Default Sounds:", response);
      const sounds = await Promise.all(
        response.data.map(async (sound: any) => {
          const id = sound.id;
          const { name, color, emoji, audio_file_url } = sound.attributes;
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
          };
        })
      );
      setSoundButtons(sounds);
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

  function openTab() {
    browser.tabs.create({ url: browser.runtime.getURL("/fullpage.html") });
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

  const tempButtons: Array<{
    label: string;
    color: string;
    emoji: string;
    url: PublicPath;
  }> = [
    {
      label: "Applause",
      color: "#BB27FF",
      emoji: "👏",
      url: "/sounds/applause.mp3",
    },
    {
      label: "Airhorn",
      color: "#E90C13",
      emoji: "🔉",
      url: "/sounds/airhorn.mp3",
    },
    {
      label: "Anime Wow",
      color: "#FF4BD8",
      emoji: "🎉",
      url: "/sounds/anime-wow.mp3",
    },
    {
      label: "Crickets",
      color: "#FF6E42",
      emoji: "🦗",
      url: "/sounds/crickets.mp3",
    },
    {
      label: "Explosion",
      color: "#008573",
      emoji: "💥",
      url: "/sounds/explosion.mp3",
    },
    {
      label: "Duck",
      color: "#00D5B8",
      emoji: "🦆",
      url: "/sounds/quack.mp3",
    },
    {
      label: "Splat",
      color: "#6200AD",
      emoji: "♠️",
      url: "/sounds/splat.mp3",
    },
    {
      label: "Drumroll",
      color: "#FFC53D",
      emoji: "🥁",
      url: "/sounds/drumroll.mp3",
    },
    {
      label: "Yippee",
      color: "#00C8FF",
      emoji: "🏳️‍🌈",
      url: "/sounds/yippee.mp3",
    },
    {
      label: "Undertale Music",
      color: "#5373F2",
      emoji: "🎵",
      url: "/sounds/bg-music.mp3",
    },
  ];

  function handleSync() {
    console.log("This would sync!");
  }

  useEffect(() => {
    // Resize the folder selector on value change
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `12px 'Instrument Sans', sans-serif`;
      const textWidth = context.measureText(selectedFolder).width;
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
                browser.tabs.create({ url: "http://localhost:3000" })
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
                  <DesktopIcon className="topBarMenuItemIcon" />
                  Sync
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="topBarMenuItem"
                  onSelect={() => {
                    browser.tabs.create({ url: "http://localhost:3000" });
                  }}
                >
                  <ExternalLinkIcon className="topBarMenuItemIcon" />
                  Settings
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
            <option value="favorites">Favorites</option>
            <option value="jokes">Jokes</option>
            <option value="dungeons-and-dragons">Dungeons & Dragons</option>
            <option value="misc">Misc</option>
          </select>
        </div>

        <div
          className="soundButtonContainer"
          style={{
            overflow: soundButtonOverflow,
            minHeight: soundButtonOverflow ? undefined : "500px",
          }}
        >
          {(searchInput !== ""
            ? fuzzysort
                .go(searchInput, soundButtons, { key: "label" })
                .map((result) => result.obj)
            : soundButtons
          ).map((button) => (
            <SoundButton
              label={button.label}
              key={button.label}
              color={button.color}
              emoji={button.emoji}
              onClick={() => playSound(button.id)}
              isPlaying={currentlyPlaying === button.id}
            />
          ))}
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
    </>
  );
}

export default App;
