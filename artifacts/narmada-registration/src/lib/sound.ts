// Pure Web Audio API synthesized temple bell chime & sacred river resonance
// Zero external assets required, instantaneous, works offline

class HolyAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Pure sacred temple bell chime (घंटी की दिव्य ध्वनि)
  public playTempleChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Fundamental frequencies of a brass temple bell
      const freqs = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 harmonics
      const gains = [0.4, 0.25, 0.15, 0.08];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(gains[i] * 0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.8);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Soft river droplet ripple click
  public playRipple() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore audio failure
    }
  }
}

export const holyAudio = new HolyAudio();
