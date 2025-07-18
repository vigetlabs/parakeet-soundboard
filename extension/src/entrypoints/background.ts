export default defineBackground(() => {
  console.log("Background loaded!", { id: browser.runtime.id });

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
