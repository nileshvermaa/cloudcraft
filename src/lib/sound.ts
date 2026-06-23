/**
 * Tiny Web-Audio SFX engine — synthesized blips, no asset files.
 * Sounds only fire from user-driven events, so the AudioContext is always
 * created inside a gesture (no autoplay issues). No-ops when disabled or SSR.
 */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean): void {
  enabled = v;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    if (!window.AudioContext) return null;
    ctx = new window.AudioContext();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.07): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

export type SoundName = 'place' | 'connect' | 'run' | 'success' | 'fail' | 'unlock';

export function playSound(name: SoundName): void {
  if (!enabled) return;
  switch (name) {
    case 'place':
      tone(440, 0, 0.12, 'triangle', 0.07);
      break;
    case 'connect':
      tone(523, 0, 0.08, 'sine', 0.06);
      tone(784, 0.07, 0.13, 'sine', 0.06);
      break;
    case 'run':
      tone(196, 0, 0.28, 'sawtooth', 0.045);
      tone(392, 0.06, 0.28, 'sawtooth', 0.035);
      break;
    case 'success':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.085, 0.2, 'triangle', 0.06));
      break;
    case 'fail':
      tone(330, 0, 0.18, 'square', 0.05);
      tone(247, 0.13, 0.3, 'square', 0.05);
      break;
    case 'unlock':
      [784, 1047, 1319].forEach((f, i) => tone(f, i * 0.06, 0.18, 'triangle', 0.06));
      break;
  }
}
