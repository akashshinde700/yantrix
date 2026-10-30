/**
 * Generated "deep space" ambience (no audio files): two detuned low drones,
 * a soft filtered noise wash and a slow filter sweep. Off by default; only
 * ever started from a click.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioScheduledSourceNode[] = [];

export function isAmbientPlaying(): boolean {
  return Boolean(ctx && master && nodes.length);
}

export function startAmbient(): void {
  if (isAmbientPlaying()) return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  const now = ctx.currentTime;

  master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.09, now + 3);
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 3;
  filter.connect(master);

  // slow sweep of the filter
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 260;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  const drones = [55, 82.41, 110.3, 164.8].map((freq, i) => {
    const o = ctx!.createOscillator();
    o.type = i % 2 ? "triangle" : "sine";
    o.frequency.value = freq;
    o.detune.value = (i - 1.5) * 6;
    const g = ctx!.createGain();
    g.gain.value = 0.32 / (i + 1);
    o.connect(g).connect(filter);
    o.start();
    return o;
  });

  // noise wash
  const length = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; // brown-ish noise
    data[i] = last * 3.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.35;
  noise.connect(noiseGain).connect(filter);
  noise.start();

  nodes = [lfo, ...drones, noise];
}

export function stopAmbient(): void {
  if (!ctx || !master) return;
  const c = ctx;
  const now = c.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  const stopping = nodes;
  nodes = [];
  master = null;
  ctx = null;
  setTimeout(() => {
    stopping.forEach((n) => n.stop());
    c.close();
  }, 1300);
}
