// popup.js

// document.getElementById("fx").addEventListener("click", () => {
//   // Find the google meet tab and run the page‐context playMicFx()
//   chrome.tabs.query({ url: "*://meet.google.com/*" }, (tabs) => {
//     for (let tab of tabs) {
//       chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: () => window.soundboard.triggerAudio,
//       });
//     }
//   });
// });

document.getElementById("run1").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (volume) {
        console.log(volume);
        window.postMessage(
          {
            command: "playAudio",
            url: chrome.runtime.getURL("sounds/bg-music.mp3"),
            volume: volume,
          },
          "*"
        );
      },
      args: [document.getElementById("fxVolume").value],
    });
  });
});

document.getElementById("run2").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (volume) {
        console.log(volume);
        window.postMessage(
          {
            command: "playAudio",
            url: chrome.runtime.getURL("sounds/deltarune-explosion.mp3"),
            volume: volume,
          },
          "*"
        );
      },
      args: [document.getElementById("fxVolume").value],
    });
  });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function () {
        window.postMessage({ command: "stopAudio" }, "*");
      },
    });
  });
});

// Get the button element
const playBtn = document.getElementById("playBtn");

// Set up audio
const audio = new Audio(chrome.runtime.getURL("sound.mp3"));
audio.preload = "auto";

const func = () => {
  const audio = new Audio(chrome.runtime.getURL("sound.mp3"));
  console.log(audio);
};

// Play on button click
playBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: func,
    });
  });
  audio.currentTime = 0;
  audio.play().catch((err) => console.error("Playback failed:", err));
});

document.getElementById("tab").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("fulltab.html") });
});

document.getElementById("micVolume").addEventListener("change", (event) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (value) {
        console.log(value);
        if (value) {
          window.postMessage({ command: "muteMicrophone" }, "*");
        } else {
          window.postMessage({ command: "unmuteMicrophone" }, "*");
        }
      },
      args: [event.target.checked],
    });
  });
});
