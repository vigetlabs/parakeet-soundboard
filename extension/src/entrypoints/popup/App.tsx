import { useState } from "react";
import "./App.css";
import { PublicPath } from "wxt/browser";
import { postMessage, playAudio } from "@/utils";
import { storage } from "#imports";

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
    postMessage("playAudio", {
      url: browser.runtime.getURL(file),
      volume: fxVolume,
    });
  }

  async function stopSound() {
    postMessage("stopAudio");
  }

  async function handleMicMute(muteMic: boolean) {
    micMutedStorage.setValue(muteMic);
    setMicMuted(muteMic);
    if (muteMic) {
      postMessage("muteMicrophone");
    } else {
      postMessage("unmuteMicrophone");
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

  return (
    <>
      <body>
        {isMeet && (
          <>
            <button onClick={() => playSound("/sounds/bg-music.mp3")}>
              Play Sound FX 1
            </button>
            <button
              onClick={() => playSound("/sounds/deltarune-explosion.mp3")}
            >
              Play Sound FX 2
            </button>
            <button onClick={stopSound}>Stop Sound FX</button>
          </>
        )}
        <button onClick={() => playAudio("/sounds/deltarune-explosion.mp3")}>
          Play Sound
        </button>
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
        <script src="popup.js"></script>
      </body>
    </>
  );
}

export default App;
