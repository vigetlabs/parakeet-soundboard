import { CrossFunctions } from "@/utils/constants";

export default defineContentScript({
  matches: ["https://meet.google.com/*"],
  runAt: "document_start",
  main() {
    const s = document.createElement("script");
    s.src = browser.runtime.getURL("/inject.js");
    (document.head || document.documentElement).appendChild(s);
    s.onload = () => s.remove();

    async function getMicMuted(event: MessageEvent<any>) {
      if (event.source !== window) return;
      if (event.data.command === CrossFunctions.GET_MIC_MUTED) {
        const micMuted = await browser.runtime.sendMessage({
          type: CrossFunctions.GET_MIC_MUTED,
        });
        let toPost = CrossFunctions.UNMUTE_MICROPHONE;
        if (micMuted) {
          toPost = CrossFunctions.MUTE_MICROPHONE;
        }
        window.postMessage(
          {
            command: toPost,
          },
          "*"
        );
      }
    }

    window.addEventListener("message", getMicMuted);
  },
});
