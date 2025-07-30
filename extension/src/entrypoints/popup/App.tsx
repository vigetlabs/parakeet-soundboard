import { useState } from "react";
import "./App.css";
import { PublicPath } from "wxt/browser";
import { postMessage, playLocalAudio, stopLocalAudio } from "@/utils";
import { storage } from "#imports";
import { CrossFunctions } from "@/utils/constants";
import { login, getMySounds, getDefaultSounds } from '@/utils/api';
import { storeSound, retrieveSound } from '@/utils/db.ts'

function App() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState("");
  const [soundButtons, setSoundButtons] = useState<any[]>([]);


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

  async function fetchSounds() {
    console.log("Fetching sounds...");
    try {
      const response = await getDefaultSounds();
      console.log('Default Sounds:', response);
      const sounds = await Promise.all(
      response.data.map(async (sound: any) => {
        const id = sound.id;
        const { name, color, emoji, audio_file_url } = sound.attributes;
        const fullUrl = `http://localhost:3001${audio_file_url}`;

        const audioResponse = await fetch(fullUrl);
        const blob = await audioResponse.blob();
        console.log('blob:', blob);

        console.log("Storing sound in IndexedDB:", id);
        await storeSound(id, blob);

        return {
          id: id,
          label: name,
          color: color || 'gray',
          emoji: emoji || '🎵',
        };
      })
    );
    setSoundButtons(sounds);
  } catch (err) {
      console.error('Failed to fetch sounds:', err);
    }
  };

  function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob); // encodes to base64
  });
}

  const [fxVolume, setFxVolume] = useState(25);
  const [micMuted, setMicMuted] = useState(false);
  function updateFxVolume(volume: number) {
    setFxVolume(volume);
    fxVolumeStorage.setValue(volume);
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
      setCurrentlyPlaying(id.toString());
    }
  }

  async function stopSound() {
    if (isMeet) {
      postMessage(CrossFunctions.STOP_AUDIO);
    }
    stopLocalAudio();
    setCurrentlyPlaying("");
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

  useEffect(() => {
    // TODO: Make it check if the audio is still playing on reopen
    const listener = (msg: any) => {
      if (msg.type === CrossFunctions.AUDIO_ENDED) {
        setCurrentlyPlaying("");
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
      color: "cornsilk",
      emoji: "👏",
      url: "/sounds/applause.mp3",
    },
    {
      label: "Airhorn",
      color: "crimson",
      emoji: "🔉",
      url: "/sounds/airhorn.mp3",
    },
    {
      label: "Anime Wow",
      color: "deeppink",
      emoji: "🎉",
      url: "/sounds/anime-wow.mp3",
    },
    {
      label: "Crickets",
      color: "darkolivegreen",
      emoji: "🦗",
      url: "/sounds/crickets.mp3",
    },
    {
      label: "Explosion",
      color: "orange",
      emoji: "💥",
      url: "/sounds/explosion.mp3",
    },
    {
      label: "Duck",
      color: "darkgreen",
      emoji: "🦆",
      url: "/sounds/quack.mp3",
    },
    {
      label: "Splat",
      color: "midnightblue",
      emoji: "♠️",
      url: "/sounds/splat.mp3",
    },
    {
      label: "Drumroll",
      color: "moccasin",
      emoji: "🥁",
      url: "/sounds/drumroll.mp3",
    },
    {
      label: "Yippee",
      color: "aliceblue",
      emoji: "🏳️‍🌈",
      url: "/sounds/yippee.mp3",
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
          <IconButton icon="gear" onClick={openTab} />
        </div>
        <div className="soundButtonContainer">
          {soundButtons.map((button) => (
            <div key={button.label}>
              <SoundButton
                label={button.label}
                color={button.color}
                emoji={button.emoji}
                onClick={() => playSound(button.id)}
                isPlaying={currentlyPlaying === button.name}
              />
            </div>
          ))}
        </div>
        <label className="rangeWrapper">
          Sound Volume
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
        <div className="flexRow">
          <label className="verticalCheckboxWrapper">
            Mute Microphone
            <input
              type="checkbox"
              name="micVolume"
              checked={micMuted}
              onChange={(e) => handleMicMute(e.target.checked)}
            />
          </label>
          <button onClick={handleTestLogin}>Test Login</button>
          <button onClick={stopSound}>Stop Sounds</button>
        </div>
        <p style={{ color: isMeet ? "green" : "red" }}>
          {isMeet ? "C" : "Not c"}onnected to meet
        </p>
      </div>
    </>
  );
}

export default App;
