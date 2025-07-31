import { useEffect, useState } from "react";

export class AudioPlayer {
  static audio = new Audio();
  static volume = 1;
  static onEnded?: () => void;
  static active = false;

  static play(fileURL: string, onEnd?: () => void) {
    if (this.onEnded) {
      this.onEnded();
    }
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.volume = this.volume;
    this.audio.src =
      `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}` +
      fileURL;
    this.audio.play().catch((err) => console.error("Playback failed:", err));
    this.setActive(true);
    if (onEnd) {
      this.onEnded = onEnd;
      this.audio.onended = () => {
        onEnd();
        this.audio.remove();
        this.setActive(false);
      };
    } else {
      this.onEnded = undefined;
      this.audio.onended = () => {
        this.setActive(false);
      };
    }
  }

  static stop() {
    this.audio.pause();
    this.audio.volume = 0;
    this.audio.currentTime = 0;
    if (this.onEnded) {
      this.onEnded();
    }
    this.setActive(false);
  }

  static setVolume(volume: number) {
    this.volume = volume / 100;
    this.audio.volume = this.volume;
  }

  static isPlaying() {
    return this.active;
  }

  private static setActive(active: boolean) {
    this.active = active;
    this.notifySubscribers();
  }

  private static listeners = new Set<(playing: boolean) => void>();
  private static notifySubscribers() {
    for (const cb of AudioPlayer.listeners) {
      try {
        cb(AudioPlayer.active);
      } catch (e) {
        console.error(e);
      }
    }
  }
  static subscribe(cb: (playing: boolean) => void) {
    AudioPlayer.listeners.add(cb);
    // return unsubscribe
    return () => void AudioPlayer.listeners.delete(cb);
  }
}

export function useAudioPlaying() {
  const [isPlaying, setIsPlaying] = useState(AudioPlayer.isPlaying());

  useEffect(() => {
    const unsubscribe = AudioPlayer.subscribe(setIsPlaying);
    setIsPlaying(AudioPlayer.isPlaying());
    return unsubscribe;
  }, []);

  return isPlaying;
}
