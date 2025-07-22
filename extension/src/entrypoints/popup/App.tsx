import { useState } from "react";
import "./App.css";
import { PublicPath } from "wxt/browser";
import { postMessage, playLocalAudio, stopLocalAudio } from "@/utils";
import { storage } from "#imports";
import { CrossFunctions } from "@/utils/constants";

function App() {
  const fxVolumeStorage = storage.defineItem<number>("local:fxVolume", {
    fallback: 25,
  });
  const micMutedStorage = storage.defineItem<boolean>("session:micMuted", {
    fallback: false,
  });

  const [fxVolume, setFxVolume] = useState(25);
  const [micMuted, setMicMuted] = useState(false);
  function updateFxVolume(volume: number) {
    setFxVolume(volume);
    fxVolumeStorage.setValue(volume);
  }

  async function playSound(file: PublicPath) {
    if (isMeet) {
      postMessage(CrossFunctions.INJECT_AUDIO, {
        url: browser.runtime.getURL(file),
        volume: fxVolume,
      });
    }
    playLocalAudio(file, fxVolume);
  }

  async function stopSound() {
    stopLocalAudio();
    if (isMeet) {
      postMessage(CrossFunctions.STOP_AUDIO);
    }
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

  const [isMeet, setIsMeet] = useState<boolean>(false);

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
    }
    loadStates();
  }, []);

  const tempButtons: Array<{
    label: string;
    color: string;
    emoji: string;
    url: PublicPath;
  }> = [
    {
      label: "Applause",
      color: "cornsilk",
      emoji: "👏",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Airhorn",
      color: "crimson",
      emoji: "🔉",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Anime Wow",
      color: "deeppink",
      emoji: "🎉",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Crickets",
      color: "darkolivegreen",
      emoji: "🦗",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Explosion",
      color: "orange",
      emoji: "💥",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Duck",
      color: "darkgreen",
      emoji: "🦆",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Splat",
      color: "midnightblue",
      emoji: "♠️",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Drumroll",
      color: "moccasin",
      emoji: "🥁",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Yippee",
      color: "aliceblue",
      emoji: "🏳️‍🌈",
      url: "/sounds/bg-music.mp3",
    },
    {
      label: "Music",
      color: "cornflowerblue",
      emoji: "🎵",
      url: "/sounds/bg-music.mp3",
    },
  ];

  return (
    <>
      <div className="wrapper">
        <div className="topBar">
          <p className="name">LOGO</p>
          <input type="text" placeholder="Search" className="searchBar"></input>
        </div>
        <div className="soundButtonContainer">
          {tempButtons.map((button) => (
            <div key={button.label}>
              <SoundButton
                label={button.label}
                color={button.color}
                emoji={button.emoji}
                onClick={() => playSound(button.url)}
              />
            </div>
          ))}
          {/* <button onClick={() => playSound("/sounds/bg-music.mp3")}>
              Play Sound FX 1
            </button>
            <button
              onClick={() => playSound("/sounds/deltarune-explosion.mp3")}
            >
              Play Sound FX 2
            </button> */}
        </div>
        <button onClick={stopSound}>Stop Sounds</button>
        <button onClick={openTab}>Open Tab</button>

        <label>
          Sound Effect Volume
          <input
            type="range"
            min="1"
            max="100"
            value={fxVolume}
            onChange={(e) => updateFxVolume(parseInt(e.target.value))}
            className="slider"
            name="fxVolume"
          />
        </label>
        <label>
          Mute Microphone
          <input
            type="checkbox"
            name="micVolume"
            checked={micMuted}
            onChange={(e) => handleMicMute(e.target.checked)}
          />
        </label>
        <p style={{ color: isMeet ? "green" : "red" }}>
          {isMeet ? "C" : "Not c"}onnected to meet
        </p>
      </div>
    </>
  );
}

export default App;
