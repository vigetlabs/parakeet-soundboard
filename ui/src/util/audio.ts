export class AudioPlayer {
  static audio = new Audio();
  static volume = 1;
  static onEnded?: () => void;

  static play(fileURL: string, onEnd?: () => void) {
    if (this.onEnded) {
      this.onEnded();
    }
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.volume = this.volume;
    this.audio.src = "http://localhost:3001" + fileURL;
    this.audio.play().catch((err) => console.error("Playback failed:", err));
    if (onEnd) {
      this.onEnded = onEnd;
      this.audio.onended = () => {
        onEnd();
        this.audio.remove();
      };
    } else {
      this.onEnded = undefined;
      this.audio.onended = () => {};
    }
  }

  static stop() {
    this.audio.pause();
    this.audio.volume = 0;
    this.audio.currentTime = 0;
  }

  static setVolume(volume: number) {
    this.volume = volume / 100;
    this.audio.volume = this.volume;
  }
}
