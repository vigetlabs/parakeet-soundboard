export enum CrossFunctions {
  INJECT_AUDIO = "parakeet-injectAudio",
  STOP_AUDIO = "parakeet-stopAudio",
  MUTE_MICROPHONE = "parakeet-muteMicrophone",
  UNMUTE_MICROPHONE = "parakeet-unmuteMicrophone",
  SET_VOLUME = "parakeet-setVolume",
  GET_MIC_MUTED = "parakeet-getMicMuted",
  AUDIO_ENDED = "parakeet-audioEnded",
  SET_AUDIO_PLAYING = "parakeet-setAudioPlaying",
  GET_AUDIO_PLAYING = "parakeet-getAudioPlaying",
  OPEN_POPUP = "parakeet-openPopup",
  SET_AUTH_TOKEN = "parakeet-setAuthToken",
  REMOVE_AUTH_TOKEN = "parakeet-removeAuthToken",
}

export type User = {
  username: string;
  email: string;
  id: number;
} | null;
