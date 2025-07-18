export default defineContentScript({
  matches: ["https://meet.google.com/*"],
  runAt: "document_start",
  main() {
    const s = document.createElement("script");
    s.src = browser.runtime.getURL("/inject.js");
    (document.head || document.documentElement).appendChild(s);
    s.onload = () => s.remove();

    window.addEventListener("message", async (event) => {
      if (event.source !== window) return;
      if (event.data.command === "getMicMuted") {
        const micMuted = await browser.runtime.sendMessage({
          type: "getMicMuted",
        });
        let toPost = "unmuteMicrophone";
        if (micMuted) {
          toPost = "muteMicrophone";
        }
        window.postMessage(
          {
            command: toPost,
          },
          "*"
        );
      }
    });
  },
});
