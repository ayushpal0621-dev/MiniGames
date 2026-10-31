// ─── Sound Manager (Web Audio API) ───────────────────────────────────────────
//
// Generates lightweight synth tones — no audio files required.

type OscType = OscillatorType;

class SoundManager {
  private ctx: AudioContext | null = null;
  private _muted = true; // Sound OFF by default

  get muted(): boolean {
    return this._muted;
  }

  set muted(value: boolean) {
    this._muted = value;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    return this._muted;
  }

  // ── Lazy-init AudioContext (must be triggered by user gesture) ────────────

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // ── Core tone player ─────────────────────────────────────────────────────

  private playTone(
    frequency: number,
    duration: number,
    type: OscType = 'sine',
    volume = 0.3,
    ramp?: { end: number },
  ): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (ramp) {
      osc.frequency.linearRampToValueAtTime(ramp.end, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playChord(notes: number[], duration: number, type: OscType = 'sine', volume = 0.15): void {
    notes.forEach((freq) => this.playTone(freq, duration, type, volume));
  }

  // ── Public sound methods ──────────────────────────────────────────────────

  playSuccess(): void {
    this.playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.25), 80); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.25), 160); // G5
  }

  playFailure(): void {
    this.playTone(330, 0.15, 'square', 0.2);
    setTimeout(() => this.playTone(262, 0.25, 'square', 0.2), 120);
  }

  playClick(): void {
    this.playTone(800, 0.05, 'sine', 0.15);
  }

  playLevelUp(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'sine', 0.2), i * 80);
    });
  }

  playCountdown(): void {
    this.playTone(440, 0.08, 'triangle', 0.2);
  }

  playGameOver(): void {
    this.playTone(440, 0.2, 'sawtooth', 0.15, { end: 220 });
    setTimeout(() => this.playTone(330, 0.3, 'sawtooth', 0.12, { end: 165 }), 200);
    setTimeout(() => this.playTone(220, 0.5, 'sawtooth', 0.1, { end: 110 }), 400);
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const soundManager = new SoundManager();
export { SoundManager };
