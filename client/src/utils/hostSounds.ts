/** Synthesized sounds — host device only (never play on player phones). */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

function chord(freqs: number[], dur: number, vol = 0.08) {
  freqs.forEach((f, i) => setTimeout(() => tone(f, dur, 'sine', vol), i * 30));
}

export type HostSound =
  | 'join'
  | 'phase'
  | 'prompt'
  | 'submit'
  | 'reveal'
  | 'vote'
  | 'correct'
  | 'wrong'
  | 'timer-urgent'
  | 'winner'
  | 'start'
  | 'select';

export function playHostSound(sound: HostSound) {
  switch (sound) {
    case 'join':
      chord([523, 659, 784], 0.25);
      break;
    case 'phase':
      tone(440, 0.08, 'triangle', 0.1);
      tone(660, 0.12, 'triangle', 0.08);
      break;
    case 'prompt':
      tone(330, 0.15, 'sine', 0.1);
      setTimeout(() => tone(440, 0.2, 'sine', 0.1), 80);
      break;
    case 'submit':
      tone(880, 0.06, 'square', 0.06);
      break;
    case 'reveal':
      chord([392, 494, 587], 0.3, 0.09);
      break;
    case 'vote':
      tone(550, 0.1, 'triangle', 0.08);
      break;
    case 'correct':
      chord([523, 659, 784, 1047], 0.35, 0.1);
      break;
    case 'wrong':
      tone(180, 0.25, 'sawtooth', 0.08);
      tone(140, 0.3, 'sawtooth', 0.06);
      break;
    case 'timer-urgent':
      tone(800, 0.04, 'square', 0.05);
      break;
    case 'winner':
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        setTimeout(() => tone(f, 0.25, 'sine', 0.1), i * 120),
      );
      break;
    case 'start':
      chord([392, 494, 587, 740], 0.4, 0.1);
      break;
    case 'select':
      tone(600, 0.08, 'triangle', 0.08);
      tone(750, 0.1, 'triangle', 0.07);
      break;
  }
}