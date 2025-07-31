import { CrossFunctions } from "@/utils/constants";

declare global {
  interface Window {
    soundboard: {
      triggerAudio?: (base64: string, volume: number) => void;
      muteMicrophone?: () => void;
      unmuteMicrophone?: () => void;
      stopAudio?: () => void;
      setVolume?: (volume: number) => void;
      fxNode?: AudioBufferSourceNode;
      fxGain?: GainNode;
      fakeDiscarded?: boolean;
      // lastRecieved?: number;
      micMuted?: boolean;
    };
  }
}

function sendMessage(command: CrossFunctions) {
  window.postMessage(
    {
      command: command,
    },
    "*"
  );
}

function base64ToArrayBuffer(base64: string) {
  const real_base64 = base64.split(',')[1];
  const binaryString = atob(real_base64);

    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

export default defineUnlistedScript(() => {
  console.log("Successfully Injected!");

  (async function () {
    const originalGUM = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );

    async function loadEffectBuffer(ctx: AudioContext, buffer: ArrayBuffer) {
      return await ctx.decodeAudioData(buffer);
    }

    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (constraints?.audio) {
        // Grab the real mic
        const realStream = await originalGUM({ audio: true, video: false });
        const audioCtx = new AudioContext();
        const srcNode = audioCtx.createMediaStreamSource(realStream);
        const destNode = audioCtx.createMediaStreamDestination();

        const micGain = audioCtx.createGain();
        micGain.gain.value = window.soundboard?.micMuted ?? false ? 0 : 1;
        srcNode.connect(micGain).connect(destNode);

        async function playSoundEffect(base64: string, volume: number) {
          // Prepare sound‐effect node (but don’t play yet)
          console.log("(inject.ts)Received sound effect base64");
          const buffer = base64ToArrayBuffer(base64);
          const fxBuffer = await loadEffectBuffer(audioCtx, buffer);
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
          window.soundboard.setVolume = (volume: number) => {
            fxGain.gain.value = volume / 100;
          };
          window.soundboard.fxNode = fxNode;
          window.soundboard.fxGain = fxGain;
        }

        // Exposes a function to call to play the effect
        // Meet calls navigator.mediaDevices.getUserMedia() twice on page load but only once when changing microphone,
        // so this adds a delay to the initial load but allows for changing past that
        const sb = {
          triggerAudio: (base64: string, volume: number) => {
            if (window.soundboard.stopAudio) {
              window.soundboard.stopAudio();
            }
            playSoundEffect(base64, volume);
          },
          muteMicrophone: () => {
            micGain.gain.value = 0;
          },
          unmuteMicrophone: () => {
            micGain.gain.value = 1;
          },
        };

        // Commented out sections are a bandage fix if Google Meet starts sending double the requests again
        if (
          !window.soundboard
          // || Date.now() - (window.soundboard.lastRecieved ?? 0) > 2000
        ) {
          console.log("Updated soundboard initial");
          window.soundboard = {
            ...sb,
            fakeDiscarded: false,
            // lastRecieved: Date.now(),
          };
        } else {
          if (
            !window.soundboard.fakeDiscarded
            // && Date.now() - (window.soundboard.lastRecieved ?? 0) < 2000
          ) {
            window.soundboard.fakeDiscarded = true;
            console.log("Got the fake!");
          } else {
            console.log("Updated soundboard update");
            window.soundboard = {
              ...sb,
              fakeDiscarded: true,
              // fakeDiscarded: false,
              // lastRecieved: Date.now(),
            };
          }
        }
        sendMessage(CrossFunctions.GET_MIC_MUTED);

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
      case CrossFunctions.INJECT_AUDIO:
        console.log("Event received for playing audio:", event.data);
        if (window.soundboard.triggerAudio) {
          window.soundboard.triggerAudio(
            event.data.base64,
            parseInt(event.data.volume)
          );
        }
        break;
      case CrossFunctions.STOP_AUDIO:
        if (window.soundboard.stopAudio) {
          window.soundboard.stopAudio();
        }
        break;
      case CrossFunctions.MUTE_MICROPHONE:
        window.soundboard.micMuted = true;
        if (window.soundboard.muteMicrophone) {
          window.soundboard.muteMicrophone();
        }
        break;
      case CrossFunctions.UNMUTE_MICROPHONE:
        window.soundboard.micMuted = false;
        if (window.soundboard.unmuteMicrophone) {
          window.soundboard.unmuteMicrophone();
        }
        break;
      case CrossFunctions.SET_VOLUME:
        if (window.soundboard.setVolume) {
          window.soundboard.setVolume(event.data.volume);
        }
        break;
    }
  });
});
