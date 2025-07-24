import { CrossFunctions } from "@/utils/constants";

export default defineBackground(() => {
  console.log("Background loaded!", { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
    if (msg.type === "SET_AUTH_TOKEN") {
      console.log("Setting auth token in background script", msg.token);
      return browser.storage.local.set({ jwt: msg.token });
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
