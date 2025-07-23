import { CrossFunctions } from "@/utils/constants";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    window.addEventListener("message", async (event) => {
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
      if (event.data.command === CrossFunctions.AUDIO_ENDED) {
        browser.runtime.sendMessage({
          type: CrossFunctions.AUDIO_ENDED,
        });
      }
    });
  },
});
