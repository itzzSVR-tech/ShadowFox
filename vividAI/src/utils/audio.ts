/**
 * Web Audio API Game Synthesizer
 * Programmatic audio generation with zero external files or network requests.
 */

class GameAudioManager {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Read mute state from local storage on build
        if (typeof window !== "undefined") {
            const savedMute = localStorage.getItem("ai_trivia_muted");
            this.isMuted = savedMute === "true";
        }
    }

    // Lazy-initialize audio context to avoid browser autoplay blocks
    private getContext(): AudioContext {
        if (!this.ctx) {
            const AudioCtxClass =
                window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtxClass();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
        return this.ctx;
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        if (typeof window !== "undefined") {
            localStorage.setItem("ai_trivia_muted", String(this.isMuted));
        }
        return this.isMuted;
    }

    public getMutedState(): boolean {
        return this.isMuted;
    }

    public playCorrect(): void {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Beautiful ascending arpeggios
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                // Soft envelope to avoid pops
                gain.gain.setValueAtTime(0, now + idx * 0.08);
                gain.gain.linearRampToValueAtTime(
                    0.12,
                    now + idx * 0.08 + 0.04,
                );
                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now + idx * 0.08 + 0.35,
                );

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.4);
            });
        } catch (e) {
            console.warn("Audio Context Error during correct chime:", e);
        }
    }

    public playIncorrect(): void {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.3); // Descending groan pitch

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {
            console.warn("Audio Context Error during incorrect buzz:", e);
        }
    }

    public playWarningTick(): void {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(950, now); // Short tense high-pitched tick

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.07);
        } catch (e) {
            console.warn("Audio Context Error during warning beep:", e);
        }
    }

    public playCompletionFanfare(): void {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Soaring celebratory notes (C major chord variations)
            const chord = [
                261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5,
            ];
            chord.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                // Alternate saw and sine for grand synth feel
                osc.type = idx % 2 === 0 ? "sine" : "triangle";
                osc.frequency.setValueAtTime(freq, now + idx * 0.05);

                // Elegant envelope fading
                gain.gain.setValueAtTime(0, now + idx * 0.05);
                gain.gain.linearRampToValueAtTime(
                    0.08,
                    now + idx * 0.05 + 0.05,
                );
                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now + idx * 0.05 + 0.8,
                );

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.05);
                osc.stop(now + idx * 0.05 + 0.9);
            });
        } catch (e) {
            console.warn("Audio Context Error during completion fanfare:", e);
        }
    }
}

export const gameAudio = new GameAudioManager();
