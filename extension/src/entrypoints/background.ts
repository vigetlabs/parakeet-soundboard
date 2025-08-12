import { CrossFunctions } from "@/utils/constants";

export default defineBackground(() => {
  console.log("Background loaded!", { id: browser.runtime.id });

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
    }
    if (msg.type === CrossFunctions.OPEN_POPUP) {
      try {
        // Does not work on Firefox
        await browser.action.openPopup();
      } catch (e) {
        console.error("openPopup failed:", e);
      }
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
