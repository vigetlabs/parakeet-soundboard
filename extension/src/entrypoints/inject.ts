declare global {
  interface Window {
    soundboard: {
      triggerAudio?: (url: string, volume: number) => void;
      muteMicrophone?: () => void;
      unmuteMicrophone?: () => void;
      stopAudio?: () => void;
      fxNode?: AudioBufferSourceNode;
      fxGain?: GainNode;
      initialized?: boolean;
    };
  }
}

export default defineUnlistedScript(() => {
  console.log("Successfully Injected!");

  (async function () {
    const originalGUM = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );

    async function loadEffectBuffer(ctx: AudioContext, url: string) {
      const data = await fetch(url).then((r) => r.arrayBuffer());
      return await ctx.decodeAudioData(data);
    }

    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (constraints?.audio) {
        // Grab the real mic
        const realStream = await originalGUM({ audio: true, video: false });
        const audioCtx = new AudioContext();
        const srcNode = audioCtx.createMediaStreamSource(realStream);
        const destNode = audioCtx.createMediaStreamDestination();

        const micGain = audioCtx.createGain();
        micGain.gain.value = 1;
        srcNode.connect(micGain).connect(destNode);

        async function playSoundEffect(url: string, volume: number) {
          // Prepare sound‐effect node (but don’t play yet)
          const fxBuffer = await loadEffectBuffer(audioCtx, url);
          let fxNode = null;
          const fxGain = audioCtx.createGain();
          fxGain.gain.value = volume / 100;

          // Attach the sound effect to the source node
          fxNode = new AudioBufferSourceNode(audioCtx, { buffer: fxBuffer });
          fxNode.connect(fxGain).connect(destNode);
          fxNode.onended = () => {
            fxGain.gain.value = 0;
          };
          fxNode.start();
          console.log("playing new audio");

          window.soundboard.stopAudio = () => {
            fxGain.gain.value = 0;
            fxNode.stop();
          };
          window.soundboard.fxNode = fxNode;
          window.soundboard.fxGain = fxGain;
        }

        // Exposes a function to call to play the effect
        // Meet calls navigator.mediaDevices.getUserMedia() twice on page load but only once when changing microphone,
        // so this adds a delay to the initial load but allows for changing past that
        const sb = {
          triggerAudio: (url: string, volume: number) => {
            if (window.soundboard.stopAudio) {
              window.soundboard.stopAudio();
            }
            playSoundEffect(url, volume);
          },
          muteMicrophone: () => {
            micGain.gain.value = 0;
          },
          unmuteMicrophone: () => {
            micGain.gain.value = 1;
          },
        };

        if (!window.soundboard) {
          console.log("Updated soundboard initial");
          window.soundboard = {
            ...sb,
            initialized: false,
          };
        } else {
          if (!window.soundboard.initialized) {
            window.soundboard.initialized = true;
            console.log("Got the fake!");
          } else {
            console.log("Updated soundboard update");
            window.soundboard = {
              ...sb,
              initialized: true,
            };
          }
        }

        console.log("Made it to return!");
        // 5) Return the mixed audio track
        return new MediaStream(destNode.stream.getAudioTracks());
      }

      // fallback for video-only or other calls
      return originalGUM(constraints);
    };
  })();

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    switch (event.data.command) {
      case "playAudio":
        console.log("recieved play " + event.data.url);
        if (window.soundboard.triggerAudio) {
          window.soundboard.triggerAudio(
            event.data.url,
            parseInt(event.data.volume)
          );
        }
        break;
      case "stopAudio":
        if (window.soundboard.stopAudio) {
          window.soundboard.stopAudio();
        }
        break;
      case "muteMicrophone":
        if (window.soundboard.muteMicrophone) {
          window.soundboard.muteMicrophone();
        }
        break;
      case "unmuteMicrophone":
        if (window.soundboard.unmuteMicrophone) {
          window.soundboard.unmuteMicrophone();
        }
        break;
    }
  });
});
