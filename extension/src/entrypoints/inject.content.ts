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
  const real_base64 = base64.split(",")[1];
  const binaryString = atob(real_base64);

  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

// Pull the requested device out of whatever constraint shape the caller used, so a
// mic change can be honoured without tearing down the graph Meet is already reading
function requestedDeviceId(
  constraints?: MediaStreamConstraints
): string | undefined {
  const audio = constraints?.audio;
  if (!audio || typeof audio === "boolean") return undefined;
  const deviceId = audio.deviceId;
  if (!deviceId) return undefined;
  if (typeof deviceId === "string") return deviceId;
  if (Array.isArray(deviceId)) return deviceId[0];
  const value = deviceId.exact ?? deviceId.ideal;
  return Array.isArray(value) ? value[0] : value;
}

export default defineContentScript({
  matches: ["https://meet.google.com/*"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    console.log("[Parakeet] Successfully Injected!");

    // Kept here rather than on window.soundboard so a mute that arrives before
    // the graph exists isn't lost
    let micMuted = false;

    // Meet calls getUserMedia several times on load and reads more than one of the
    // returned tracks, so there's no reliable way to guess which one feeds the call.
    // Every call is served from this one graph instead, so whichever track Meet
    // uses carries the same mix.
    let graph: {
      audioCtx: AudioContext;
      destNode: MediaStreamAudioDestinationNode;
      micGain: GainNode;
      srcNode: MediaStreamAudioSourceNode;
      realStream: MediaStream;
      deviceId?: string;
    } | null = null;

    const originalGUM = MediaDevices.prototype.getUserMedia.bind(
      navigator.mediaDevices
    );

    async function captureRealMic(deviceId?: string) {
      return await originalGUM({
        audio: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
    }

    async function ensureGraph(constraints?: MediaStreamConstraints) {
      const wantedDeviceId = requestedDeviceId(constraints);

      if (graph) {
        // New device: swap only the input so every track Meet already holds
        // stays live and still carries our mix
        if (wantedDeviceId && wantedDeviceId !== graph.deviceId) {
          const realStream = await captureRealMic(wantedDeviceId);
          graph.srcNode.disconnect();
          graph.realStream.getTracks().forEach((t) => t.stop());
          graph.realStream = realStream;
          graph.srcNode = graph.audioCtx.createMediaStreamSource(realStream);
          graph.srcNode.connect(graph.micGain);
          graph.deviceId =
            realStream.getAudioTracks()[0]?.getSettings().deviceId;
        }
        return graph;
      }

      const realStream = await captureRealMic(wantedDeviceId);
      const audioCtx = new AudioContext();
      const srcNode = audioCtx.createMediaStreamSource(realStream);
      const destNode = audioCtx.createMediaStreamDestination();
      const micGain = audioCtx.createGain();
      micGain.gain.value = micMuted ? 0 : 1;
      srcNode.connect(micGain).connect(destNode);

      graph = {
        audioCtx,
        destNode,
        micGain,
        srcNode,
        realStream,
        deviceId: realStream.getAudioTracks()[0]?.getSettings().deviceId,
      };

      async function playSoundEffect(base64: string, volume: number) {
        const buffer = base64ToArrayBuffer(base64);
        const fxBuffer = await audioCtx.decodeAudioData(buffer);

        const fxNode = new AudioBufferSourceNode(audioCtx, { buffer: fxBuffer });
        const fxGain = audioCtx.createGain();
        fxGain.gain.value = volume / 100;

        fxNode.connect(fxGain).connect(destNode);
        fxNode.onended = () => {
          sendMessage(CrossFunctions.AUDIO_ENDED);
        };
        fxNode.start();

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

      // Firefox suspends a context created without a user gesture, and a suspended
      // context renders silence into destNode, so resume before every change
      window.soundboard = {
        triggerAudio: (base64: string, volume: number) => {
          audioCtx.resume();
          if (window.soundboard.stopAudio) {
            window.soundboard.stopAudio();
          }
          playSoundEffect(base64, volume);
        },
        muteMicrophone: () => {
          audioCtx.resume();
          micGain.gain.value = 0;
        },
        unmuteMicrophone: () => {
          audioCtx.resume();
          micGain.gain.value = 1;
        },
      };

      return graph;
    }

    // Patch the prototype rather than the navigator.mediaDevices instance, so
    // MediaDevices.prototype.getUserMedia.call(...) can't bypass the override
    MediaDevices.prototype.getUserMedia = async function (constraints) {
      if (!constraints?.audio) {
        // fallback for video-only or other calls
        return originalGUM(constraints);
      }

      const { destNode } = await ensureGraph(constraints);

      sendMessage(CrossFunctions.GET_MIC_MUTED);
      console.log("[Parakeet] Microphone Overwritten!");

      // A clone per call: Meet stops the tracks of calls it discards, and stopping
      // a clone leaves the shared graph and every other clone running
      return new MediaStream([destNode.stream.getAudioTracks()[0].clone()]);
    };

    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      switch (event.data.command) {
        case CrossFunctions.INJECT_AUDIO:
          window.soundboard?.triggerAudio?.(
            event.data.base64,
            parseInt(event.data.volume)
          );
          break;
        case CrossFunctions.STOP_AUDIO:
          window.soundboard?.stopAudio?.();
          break;
        case CrossFunctions.MUTE_MICROPHONE:
          micMuted = true;
          window.soundboard?.muteMicrophone?.();
          break;
        case CrossFunctions.UNMUTE_MICROPHONE:
          micMuted = false;
          window.soundboard?.unmuteMicrophone?.();
          break;
        case CrossFunctions.SET_VOLUME:
          window.soundboard?.setVolume?.(event.data.volume);
          break;
      }
    });
  },
});
