import { CrossFunctions } from "@/utils/constants";

export default defineBackground(() => {
  console.log("Background loaded!", { id: browser.runtime.id });

  let audioPlaying: number | null = null;

  browser.runtime.onInstalled.addListener(function (object) {
    if (object.reason === browser.runtime.OnInstalledReason.INSTALL) {
      openInfoPage();
    }
  });

  browser.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === CrossFunctions.GET_MIC_MUTED) {
      storage
        .getItem("session:micMuted", { defaultValue: false })
        .then((val) => {
          sendResponse(val);
        })
        .catch((err) => {
          console.error("Error fetching mic muted status", err);
          sendResponse(false);
        });
      return true; // tells the caller that there will be a response
    } else if (msg.type === CrossFunctions.OPEN_POPUP) {
      try {
        await browser.action.openPopup();
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
    }
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
