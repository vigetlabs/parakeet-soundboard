import { useState } from "react";
import "./App.css";
import { PublicPath } from "wxt/browser";
import { postMessage, playAudio } from "@/utils";
import { storage } from "#imports";
import { CrossFunctions } from "@/utils/constants";
import { login, getMySounds, openGoogleAuth } from '@/utils/api';

function App() {
  const fxVolumeStorage = storage.defineItem<number>("local:fxVolume", {
    fallback: 25,
  });
  const micMutedStorage = storage.defineItem<boolean>("session:micMuted", {
    fallback: false,
  });

  const handleTestLogin = async () => {
    console.log("Testing login...");
    try {
      const jwt = await login('natalietest@example.com', 'password123');
      console.log('JWT:', jwt);
      const sounds = await getMySounds();
      console.log('My Sounds:', sounds);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await openGoogleAuth();
      console.log('Google Auth window opened!');
    } catch (err) {
      console.error('Failed to open Google Auth:', err);
    }
  };

  const [fxVolume, setFxVolume] = useState(25);
  const [micMuted, setMicMuted] = useState(false);
  function updateFxVolume(volume: number) {
    setFxVolume(volume);
    fxVolumeStorage.setValue(volume);
  }

  async function playSound(file: PublicPath) {
    postMessage(CrossFunctions.INJECT_AUDIO, {
      url: browser.runtime.getURL(file),
      volume: fxVolume,
    });
  }

  async function stopSound() {
    postMessage(CrossFunctions.STOP_AUDIO);
  }

  async function handleMicMute(muteMic: boolean) {
    micMutedStorage.setValue(muteMic);
    setMicMuted(muteMic);
    if (muteMic) {
      postMessage(CrossFunctions.MUTE_MICROPHONE);
    } else {
      postMessage(CrossFunctions.UNMUTE_MICROPHONE);
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
        <button onClick={handleTestLogin}>Test Login</button>
        <button onClick={handleGoogleAuth}>Login with Google</button>
        <script src="popup.js"></script>
      </body>
    </>
  );
}

export default App;
