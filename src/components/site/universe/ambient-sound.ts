/**
 * Generated "deep space" ambience (no audio files), voiced for laptop and
 * phone speakers — which cannot reproduce deep bass, so the body of the sound
 * sits in the 200–600 Hz range:
 *   - a warm detuned pad chord (A minor 9 colour) through a slowly breathing filter
 *   - soft "star" chimes at random moments, through an echo
 *   - a quiet filtered-noise wind
 * Audio can only start from a user gesture (browser autoplay rules): the
 * entrance-door click, a sound button, or the first click of a returning
 * visitor who left sound on. The choice is remembered in localStorage.
 */

const PREF_KEY = "yantrix_sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sources: AudioScheduledSourceNode[] = [];
let chimeTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => fn());

/** Subscribe to play/stop changes (for useSyncExternalStore). */
export function subscribeAmbient(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isAmbientPlaying(): boolean {
  return Boolean(ctx && master);
}

/** "on" | "off" | null (never chosen) */
export function soundPreference(): "on" | "off" | null {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

function savePreference(value: "on" | "off") {
  try {
    localStorage.setItem(PREF_KEY, value);
  } catch {
    /* private mode */
  }
}

function chime(c: AudioContext, into: AudioNode) {
  const notes = [659.25, 783.99, 880, 987.77, 1174.66, 1318.51];
  const f = notes[Math.floor(Math.random() * notes.length)];
  const now = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = f;
  const o2 = c.createOscillator(); // soft bell overtone
  o2.type = "sine";
  o2.frequency.value = f * 2.01;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
  const g2 = c.createGain();
  g2.gain.value = 0.25;
  o.connect(g);
  o2.connect(g2).connect(g);
  g.connect(into);
  o.start(now);
  o2.start(now);
  o.stop(now + 3.4);
  o2.stop(now + 3.4);
}

/**
 * `delay` (seconds) lets the door chime finish before the ambience swells in.
 * Never throws: if the browser refuses audio (privacy extensions, no output
 * device, policies) the sound simply stays off.
 */
export function startAmbient(options: { delay?: number } = {}): void {
  try {
    startAmbientUnsafe(options);
  } catch (error) {
    console.warn("[sound] could not start ambience:", error);
    const c = ctx;
    if (chimeTimer) clearTimeout(chimeTimer);
    ctx = null;
    master = null;
    sources = [];
    void c?.close().catch(() => {});
    notify();
  }
}

function startAmbientUnsafe({ delay = 0 }: { delay?: number }): void {
  if (isAmbientPlaying()) return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const c = new AC();
  ctx = c;
  void c.resume();
  const now = c.currentTime;

  // master chain: gain → gentle compressor → speakers
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, now + delay);
  out.gain.exponentialRampToValueAtTime(0.42, now + delay + 2.5);
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  out.connect(comp).connect(c.destination);
  master = out;

  // ── pad: detuned pairs through a breathing low-pass ──
  const padFilter = c.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 1400;
  padFilter.Q.value = 0.7;
  const padGain = c.createGain();
  padGain.gain.value = 0.55;
  padFilter.connect(padGain).connect(out);

  const breath = c.createOscillator();
  breath.frequency.value = 0.07;
  const breathDepth = c.createGain();
  breathDepth.gain.value = 650;
  breath.connect(breathDepth).connect(padFilter.frequency);
  breath.start();

  const voices: AudioScheduledSourceNode[] = [];
  [110, 220, 261.63, 329.63, 392, 493.88].forEach((freq, i) => {
    for (const detune of [-7, 7]) {
      const o = c.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = freq;
      o.detune.value = detune;
      const g = c.createGain();
      // 110 Hz is only a faint foundation — small speakers cannot play it; the chord carries the sound
      g.gain.value = i === 0 ? 0.035 : 0.15 / (1 + (i - 1) * 0.12);
      o.connect(g).connect(padFilter);
      o.start();
      voices.push(o);
    }
  });

  // ── wind: band-passed noise drifting in pitch ──
  const length = c.sampleRate * 4;
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const windFilter = c.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 700;
  windFilter.Q.value = 0.9;
  const windGain = c.createGain();
  windGain.gain.value = 0.045;
  noise.connect(windFilter).connect(windGain).connect(out);
  const windLfo = c.createOscillator();
  windLfo.frequency.value = 0.05;
  const windDepth = c.createGain();
  windDepth.gain.value = 350;
  windLfo.connect(windDepth).connect(windFilter.frequency);
  windLfo.start();
  noise.start();

  // ── chimes through an echo ──
  const echo = c.createDelay(1);
  echo.delayTime.value = 0.42;
  const feedback = c.createGain();
  feedback.gain.value = 0.38;
  const chimeBus = c.createGain();
  chimeBus.gain.value = 0.9;
  chimeBus.connect(out);
  chimeBus.connect(echo);
  echo.connect(feedback).connect(echo);
  echo.connect(out);
  const scheduleChime = () => {
    chimeTimer = setTimeout(() => {
      if (ctx !== c) return;
      chime(c, chimeBus);
      scheduleChime();
    }, 2200 + Math.random() * 3800);
  };
  scheduleChime();

  sources = [breath, windLfo, noise, ...voices];
  savePreference("on");
  notify();
}

export function stopAmbient({ remember = true }: { remember?: boolean } = {}): void {
  if (!ctx || !master) return;
  const c = ctx;
  const now = c.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1);
  if (chimeTimer) clearTimeout(chimeTimer);
  const stopping = sources;
  sources = [];
  master = null;
  ctx = null;
  if (remember) savePreference("off");
  notify();
  setTimeout(() => {
    stopping.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    void c.close();
  }, 1100);
}

export function toggleAmbient(): void {
  if (isAmbientPlaying()) stopAmbient();
  else startAmbient();
}

/**
 * For returning visitors who left sound on: start on their first click/tap/key
 * (the earliest moment browsers allow audio). Returns a cleanup function.
 */
export function resumeAmbientOnFirstGesture(): () => void {
  if (soundPreference() !== "on" || isAmbientPlaying()) return () => {};
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const handler = () => {
    cleanup();
    startAmbient();
  };
  const cleanup = () => events.forEach((e) => window.removeEventListener(e, handler));
  events.forEach((e) => window.addEventListener(e, handler, { once: true, passive: true }));
  return cleanup;
}
