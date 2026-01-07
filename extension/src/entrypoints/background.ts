import { CrossFunctions } from "@/utils/constants";

export default defineBackground(() => {

  let audioPlaying: number | null = null;

  browser.runtime.onInstalled.addListener(function (object) {
    if (object.reason === browser.runtime.OnInstalledReason.INSTALL) {
      openInfoPage();
    }
  });

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === CrossFunctions.GET_MIC_MUTED) {
      storage.getItem("session:micMuted")
        .then(val => {
          sendResponse(val ?? false);
        })
        .catch(err => {
          console.error("Error fetching mic muted status", err);
          sendResponse(false);
        });
      return true; // tells the caller that there will be a response
    } else if (msg.type === CrossFunctions.OPEN_POPUP) {
      try {
        browser.action.openPopup();
      } catch (e) {
        console.warn("openPopup failed:", e);
      }
    } else if (msg.type === CrossFunctions.SET_AUDIO_PLAYING) {
      audioPlaying = msg.audioID;
    } else if (msg.type === CrossFunctions.GET_AUDIO_PLAYING) {
      sendResponse(audioPlaying);
      return true;
    } else if (msg.type === CrossFunctions.AUDIO_ENDED) {
      audioPlaying = null;
    } else if (msg.type === CrossFunctions.SET_AUTH_TOKEN) {
      storage.setItem("local:jwt", msg.token);
      storage.setItem("local:refresh", msg.refreshToken);
    } else if (msg.type === CrossFunctions.REMOVE_AUTH_TOKEN) {
      storage.removeItem("local:jwt");
      storage.removeItem("local:refresh");
    } else if (msg.type === CrossFunctions.MUTE_MICROPHONE) {
      storage.setItem("session:micMuted", true)
        .then(() => browser.tabs.query({ url: "https://meet.google.com/*" }))
        .then(tabs => {
          tabs.forEach(tab => {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, {
                type: CrossFunctions.MUTE_MICROPHONE
              });
            }
          });
        });
    } else if (msg.type === CrossFunctions.UNMUTE_MICROPHONE) {
      storage.setItem("session:micMuted", false)
        .then(() => browser.tabs.query({ url: "https://meet.google.com/*" }))
        .then(tabs => {
          tabs.forEach(tab => {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, {
                type: CrossFunctions.UNMUTE_MICROPHONE
              });
            }
          });
        });
    };
  });

  // If we want to disable to chrome extension outside google meet:
  // browser.runtime.onInstalled.addListener(() => {
  //   browser.action.disable();
  //   browser.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //     browser.declarativeContent.onPageChanged.addRules([
  //       {
  //         conditions: [
  //           new browser.declarativeContent.PageStateMatcher({
  //             pageUrl: { urlContains: "meet.google.com", schemes: ["https"] },
  //           }),
  //         ],
  //         actions: [new browser.declarativeContent.ShowAction()],
  //       },
  //     ]);
  //   });
  // });
});
