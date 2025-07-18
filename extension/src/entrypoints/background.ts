export default defineBackground(() => {
  console.log("Background loaded!", { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getMicMuted") {
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
