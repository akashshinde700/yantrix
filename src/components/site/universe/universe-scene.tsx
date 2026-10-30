"use client";

/**
 * The 3D universe behind the whole site.
 *
 * One fixed full-screen WebGL canvas. On the home page the camera flies from
 * object to object as the visitor scrolls through the chapters; on the other
 * pages it parks at that page's object. Everything is procedural (no assets).
 *
 * Performance:
 * - lighter object counts, lower pixel ratio and no bloom on small screens
 * - paused while the tab is hidden
 * - prefers-reduced-motion: objects stay still, the camera jumps between
 *   chapters instead of flying, and frames are only drawn when needed
 *
 * Loaded through next/dynamic (ssr: false) so three.js never ships in the
 * server bundle and does not block first paint.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { SiteView } from "@/lib/content/types";
import { CHAPTERS, VIEW_CHAPTER } from "@/components/site/universe/chapters";

/* ───────────────────────────── shaders ───────────────────────────── */

// Ashima Arts 3D simplex noise (MIT) + fbm
const NOISE = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  float fbm(vec3 p){float v=0.0;float a=0.5;for(int i=0;i<4;i++){v+=a*snoise(p);p*=2.02;a*=0.5;}return v;}
`;

const PLANET_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  void main(){
    vPos = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uRim;
  uniform vec3 uLightDir;
  uniform float uTime;
  uniform float uBands;
  uniform float uEmissive;
  uniform float uScale;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  ${NOISE}
  void main(){
    vec3 p = normalize(vPos);
    float n = fbm(vec3(p.x * uScale, p.y * uScale * (1.0 + uBands * 5.0), p.z * uScale) + uTime * 0.03);
    float bands = sin(p.y * 16.0 + n * 3.5) * 0.5 + 0.5;
    float t = mix(n * 0.5 + 0.5, bands, uBands);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 0.75, t));
    col = mix(col, uColorC, smoothstep(0.62, 0.95, n * 0.5 + 0.5));
    float diff = max(dot(vWorldNormal, normalize(uLightDir)), 0.0);
    float light = max(mix(0.08, 1.15, diff), uEmissive);
    float fres = pow(1.0 - max(dot(vWorldNormal, vViewDir), 0.0), 2.6);
    gl_FragColor = vec4(col * light + uRim * fres, 1.0);
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormalV;
  void main(){
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormalV;
  void main(){
    float i = pow(max(0.0, 0.72 - dot(vNormalV, vec3(0.0, 0.0, 1.0))), 3.0);
    gl_FragColor = vec4(uColor, 1.0) * i * uStrength;
  }
`;

const RING_VERT = /* glsl */ `
  uniform float uInner;
  uniform float uOuter;
  varying float vR;
  void main(){
    vR = (length(position.xy) - uInner) / (uOuter - uInner);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vR;
  void main(){
    float bands = sin(vR * 70.0) * 0.5 + 0.5;
    bands *= sin(vR * 23.0 + 1.3) * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.08, vR) * smoothstep(1.0, 0.85, vR);
    vec3 col = mix(uColorA, uColorB, vR);
    gl_FragColor = vec4(col, edge * (0.25 + 0.75 * bands) * uOpacity);
  }
`;

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vTwinkle = 0.6 + 0.4 * sin(uTime * (0.6 + aPhase) + aPhase * 12.0);
    gl_PointSize = aSize * uPixelRatio * (220.0 / -mv.z);
    vColor = aColor;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * vTwinkle, core * core);
  }
`;

const GALAXY_VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (90.0 / -mv.z);
    vColor = aColor;
  }
`;

const GALAXY_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, pow(1.0 - d * 2.0, 2.0));
  }
`;

/* ───────────────────────────── helpers ───────────────────────────── */

/** Deterministic PRNG so the universe looks the same on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.2, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function nebulaTexture(seed: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const rand = rng(seed);
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) {
    const x = 128 + (rand() - 0.5) * 140;
    const y = 128 + (rand() - 0.5) * 90;
    const r = 30 + rand() * 70;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + rand() * 0.07;
    grad.addColorStop(0, `rgba(255,255,255,${a})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const LIGHT_DIR = new THREE.Vector3(-0.6, 0.45, 0.7).normalize();

interface PlanetOptions {
  radius: number;
  colors: [string, string, string];
  rim: string;
  atmosphere?: string;
  atmosphereStrength?: number;
  bands?: number;
  emissive?: number;
  scale?: number;
  segments?: number;
}

function makePlanet(o: PlanetOptions) {
  const group = new THREE.Group();
  const uniforms = {
    uColorA: { value: new THREE.Color(o.colors[0]) },
    uColorB: { value: new THREE.Color(o.colors[1]) },
    uColorC: { value: new THREE.Color(o.colors[2]) },
    uRim: { value: new THREE.Color(o.rim) },
    uLightDir: { value: LIGHT_DIR },
    uTime: { value: 0 },
    uBands: { value: o.bands ?? 0 },
    uEmissive: { value: o.emissive ?? 0 },
    uScale: { value: o.scale ?? 2.2 },
  };
  const seg = o.segments ?? 64;
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(o.radius, seg, seg),
    new THREE.ShaderMaterial({
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG,
      uniforms,
    }),
  );
  group.add(body);
  if (o.atmosphere) {
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(o.radius * 1.22, 48, 48),
      new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(o.atmosphere) },
          uStrength: { value: o.atmosphereStrength ?? 1.4 },
        },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    );
    group.add(atmo);
  }
  return { group, body, uniforms };
}

function makeRing(
  inner: number,
  outer: number,
  a: string,
  b: string,
  opacity: number,
) {
  return new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 160, 1),
    new THREE.ShaderMaterial({
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      uniforms: {
        uInner: { value: inner },
        uOuter: { value: outer },
        uColorA: { value: new THREE.Color(a) },
        uColorB: { value: new THREE.Color(b) },
        uOpacity: { value: opacity },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function makeOrbitLine(radius: number, color: string, opacity: number) {
  const pts = new THREE.EllipseCurve(
    0,
    0,
    radius,
    radius,
    0,
    Math.PI * 2,
  ).getPoints(160);
  const geo = new THREE.BufferGeometry().setFromPoints(
    pts.map((p) => new THREE.Vector3(p.x, 0, p.y)),
  );
  return new THREE.LineLoop(
    geo,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  );
}

function makeGlow(
  tex: THREE.Texture,
  color: string,
  scale: number,
  opacity = 1,
) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  s.scale.setScalar(scale);
  return s;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

/* ───────────────────────────── component ───────────────────────────── */

/** Chapter anchor positions (object centres) along the flight path. */
const ANCHORS: [number, number, number][] = [
  [3.4, 0, 0],
  [-6.5, 0.8, -36],
  [6.5, -0.4, -72],
  [-6.5, 0.4, -108],
  [-6.5, 0, -144], // About: behind the photo column, away from the copy
  [6.8, 0.8, -180],
  [6.5, -0.4, -216],
  [0, -1.2, -262],
];
/**
 * Camera x as a fraction of the object's x. 0 keeps the object off-centre;
 * negative values push it further out so it frames the centred section
 * headings from the screen edge instead of sitting behind them.
 */
const SIDE = [0.05, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, 0];

export default function UniverseScene({ view }: { view: SiteView }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let teardown: () => void = () => {};

    /*
     * Built in idle time after the first paint (behind the entrance door when
     * it is showing), shaders compiled asynchronously — so the page paints and
     * scrolls immediately instead of freezing while the universe is created.
     */
    const boot = async () => {
      if (cancelled) return;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      /** layout: phone-sized screen (camera framing) */
      const small = window.innerWidth < 768;
      /** quality: phones and low-end laptops get fewer particles, no bloom, lower resolution */
      const device = navigator as Navigator & { deviceMemory?: number };
      const lite =
        small ||
        (navigator.hardwareConcurrency ?? 8) <= 4 ||
        (device.deviceMemory ?? 8) <= 4;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !lite,
          powerPreference: "high-performance",
        });
      } catch {
        return; // no WebGL — the CSS backdrop stays
      }
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        lite ? 1.25 : 1.5,
      );
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x02040c, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        600,
      );

      const glowTex = glowTexture();
      const animated: ((t: number, dt: number) => void)[] = [];
      const planetUniforms: { uTime: { value: number } }[] = [];

      /* Lights (for the faceted crystals and rocks) */
      scene.add(new THREE.AmbientLight(0x6677aa, 0.6));
      const sun = new THREE.DirectionalLight(0xffffff, 2.2);
      sun.position.copy(LIGHT_DIR).multiplyScalar(20);
      scene.add(sun);

      /* ── Starfield ── */
      {
        const count = lite ? 2600 : 5200;
        const rand = rng(11);
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const phase = new Float32Array(count);
        const palette = [
          new THREE.Color("#ffffff"),
          new THREE.Color("#bcd4ff"),
          new THREE.Color("#a5f3fc"),
          new THREE.Color("#d8b4fe"),
          new THREE.Color("#fde68a"),
        ];
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (rand() - 0.5) * 180;
          pos[i * 3 + 1] = (rand() - 0.5) * 110;
          pos[i * 3 + 2] = 40 - rand() * 360;
          const c = palette[Math.floor(rand() * palette.length)];
          col[i * 3] = c.r;
          col[i * 3 + 1] = c.g;
          col[i * 3 + 2] = c.b;
          size[i] = 0.4 + Math.pow(rand(), 3) * 2.4;
          phase[i] = rand();
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
        geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
        geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
        const uniforms = {
          uTime: { value: 0 },
          uPixelRatio: { value: pixelRatio },
        };
        const stars = new THREE.Points(
          geo,
          new THREE.ShaderMaterial({
            vertexShader: STAR_VERT,
            fragmentShader: STAR_FRAG,
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        scene.add(stars);
        animated.push((t) => (uniforms.uTime.value = t));
      }

      /* ── Nebula clouds along the path ── */
      {
        const rand = rng(29);
        const colors = [
          "#4f46e5",
          "#7c3aed",
          "#0891b2",
          "#2563eb",
          "#c026d3",
          "#0ea5e9",
        ];
        const textures = [nebulaTexture(1), nebulaTexture(2), nebulaTexture(3)];
        const clouds = lite ? 10 : 16;
        for (let i = 0; i < clouds; i++) {
          const s = makeGlow(
            textures[i % 3],
            colors[i % colors.length],
            45 + rand() * 45,
            0.07 + rand() * 0.07,
          );
          s.material.map = textures[i % 3];
          // keep clouds off the flight path so they frame the scene instead of fogging it
          const sideX = (i % 2 ? 1 : -1) * (26 + rand() * 30);
          s.position.set(
            sideX,
            (rand() - 0.5) * 36,
            -20 - (i / clouds) * 300 - rand() * 20,
          );
          s.material.rotation = rand() * Math.PI * 2;
          scene.add(s);
          const speed = (rand() - 0.5) * 0.02;
          animated.push((_t, dt) => (s.material.rotation += speed * dt));
        }
      }

      /* ── 0. Hero: Yantrix core planet ── */
      {
        const [x, y, z] = ANCHORS[0];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const p = makePlanet({
          radius: 2.2,
          colors: ["#0b1d5c", "#1d4ed8", "#67e8f9"],
          rim: "#38bdf8",
          atmosphere: "#22d3ee",
          atmosphereStrength: 1.6,
          scale: 2.4,
        });
        root.add(p.group);
        planetUniforms.push(p.uniforms);
        const ring = makeRing(2.9, 4.6, "#22d3ee", "#6366f1", 0.75);
        ring.rotation.set(Math.PI / 2.35, 0.25, 0);
        root.add(ring);
        const orbit = new THREE.Group();
        orbit.rotation.set(0.35, 0, 0.18);
        orbit.add(makeOrbitLine(6, "#67e8f9", 0.18));
        const moonA = makePlanet({
          radius: 0.32,
          colors: ["#3b2a7a", "#a78bfa", "#e9d5ff"],
          rim: "#c4b5fd",
          segments: 32,
        });
        const moonB = makePlanet({
          radius: 0.22,
          colors: ["#1e293b", "#94a3b8", "#e2e8f0"],
          rim: "#e2e8f0",
          segments: 32,
        });
        orbit.add(moonA.group, moonB.group);
        root.add(orbit);
        scene.add(root);
        animated.push((t, dt) => {
          p.body.rotation.y += dt * 0.08;
          ring.rotation.z += dt * 0.02;
          moonA.group.position.set(
            Math.cos(t * 0.25) * 6,
            0,
            Math.sin(t * 0.25) * 6,
          );
          moonB.group.position.set(
            Math.cos(t * 0.4 + 2) * 6,
            0,
            Math.sin(t * 0.4 + 2) * 6,
          );
        });
      }

      /* ── 1. Skills: ringed gas giant ── */
      {
        const [x, y, z] = ANCHORS[1];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const p = makePlanet({
          radius: 2.6,
          colors: ["#2e1065", "#6d28d9", "#c084fc"],
          rim: "#a78bfa",
          atmosphere: "#8b5cf6",
          atmosphereStrength: 1.1,
          bands: 1,
          scale: 1.6,
        });
        p.group.rotation.z = 0.3;
        root.add(p.group);
        planetUniforms.push(p.uniforms);
        const ring = makeRing(3.4, 6.2, "#d8b4fe", "#38bdf8", 0.6);
        ring.rotation.set(Math.PI / 2.2, 0, 0.3);
        root.add(ring);
        scene.add(root);
        animated.push((_t, dt) => (p.body.rotation.y += dt * 0.12));
      }

      /* ── 2. Why us: crystal cluster ── */
      {
        const [x, y, z] = ANCHORS[2];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const point = new THREE.PointLight(0x22d3ee, 30, 30);
        point.position.set(0, 2, 4);
        root.add(point);
        const rand = rng(5);
        const geos = [
          new THREE.OctahedronGeometry(1.5),
          new THREE.IcosahedronGeometry(0.9),
          new THREE.DodecahedronGeometry(0.75),
          new THREE.TetrahedronGeometry(0.9),
          new THREE.OctahedronGeometry(0.6),
          new THREE.IcosahedronGeometry(0.55),
          new THREE.OctahedronGeometry(0.45),
        ];
        const tints = [
          0x7dd3fc, 0xa5f3fc, 0xc084fc, 0x93c5fd, 0x67e8f9, 0xe9d5ff, 0x22d3ee,
        ];
        geos.forEach((geo, i) => {
          const mesh = new THREE.Mesh(
            geo,
            new THREE.MeshStandardMaterial({
              color: tints[i],
              emissive: tints[i],
              emissiveIntensity: 0.18,
              metalness: 0.2,
              roughness: 0.15,
              flatShading: true,
            }),
          );
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({
              color: 0xe0f2fe,
              transparent: true,
              opacity: 0.45,
            }),
          );
          mesh.add(edges);
          const angle = (i / geos.length) * Math.PI * 2;
          const dist = i === 0 ? 0 : 2 + rand() * 1.4;
          mesh.position.set(
            Math.cos(angle) * dist,
            (rand() - 0.5) * 2.4,
            Math.sin(angle) * dist * 0.6,
          );
          if (i === 0) mesh.scale.set(1, 1.6, 1);
          root.add(mesh);
          const spin = 0.15 + rand() * 0.3;
          const bob = rand() * Math.PI * 2;
          const baseY = mesh.position.y;
          animated.push((t, dt) => {
            mesh.rotation.y += dt * spin;
            mesh.rotation.x += dt * spin * 0.4;
            mesh.position.y = baseY + Math.sin(t * 0.6 + bob) * 0.25;
          });
        });
        root.add(makeGlow(glowTex, "#22d3ee", 7, 0.3));
        scene.add(root);
      }

      /* ── 3. Training modes: twin planets ── */
      {
        const [x, y, z] = ANCHORS[3];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const pair = new THREE.Group();
        pair.rotation.x = 0.35;
        const online = makePlanet({
          radius: 1.3,
          colors: ["#082f49", "#0891b2", "#a5f3fc"],
          rim: "#67e8f9",
          atmosphere: "#22d3ee",
        });
        const offline = makePlanet({
          radius: 1.15,
          colors: ["#1e1b4b", "#4f46e5", "#fcd34d"],
          rim: "#a5b4fc",
          atmosphere: "#818cf8",
        });
        planetUniforms.push(online.uniforms, offline.uniforms);
        pair.add(
          online.group,
          offline.group,
          makeOrbitLine(2, "#a5b4fc", 0.25),
        );
        root.add(pair);
        scene.add(root);
        animated.push((t, dt) => {
          online.group.position.set(
            Math.cos(t * 0.3) * 2,
            0,
            Math.sin(t * 0.3) * 2,
          );
          offline.group.position.set(
            -Math.cos(t * 0.3) * 2,
            0,
            -Math.sin(t * 0.3) * 2,
          );
          online.body.rotation.y += dt * 0.2;
          offline.body.rotation.y += dt * 0.15;
        });
      }

      /* ── 4. About: geodesic knowledge core ── */
      {
        const [x, y, z] = ANCHORS[4];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const inner = new THREE.IcosahedronGeometry(2.3, 2);
        const lines = new THREE.LineSegments(
          new THREE.EdgesGeometry(inner),
          new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.85,
          }),
        );
        const nodes = new THREE.Points(
          inner,
          new THREE.PointsMaterial({
            color: 0xc4b5fd,
            size: 0.09,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
          }),
        );
        const shell = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.3, 0)),
          new THREE.LineBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.35,
          }),
        );
        const core = makePlanet({
          radius: 1.1,
          colors: ["#bae6fd", "#e0f2fe", "#ffffff"],
          rim: "#ffffff",
          emissive: 1,
          segments: 32,
        });
        planetUniforms.push(core.uniforms);
        root.add(
          lines,
          nodes,
          shell,
          core.group,
          makeGlow(glowTex, "#a78bfa", 9, 0.45),
          makeGlow(glowTex, "#e0f2fe", 4, 0.6),
        );
        scene.add(root);
        animated.push((_t, dt) => {
          lines.rotation.y += dt * 0.1;
          nodes.rotation.y += dt * 0.1;
          shell.rotation.y -= dt * 0.06;
          shell.rotation.x += dt * 0.03;
        });
      }

      /* ── 5. Placement: launch star ── */
      {
        const [x, y, z] = ANCHORS[5];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const star = makePlanet({
          radius: 2.3,
          colors: ["#9a3412", "#f97316", "#fed7aa"],
          rim: "#fdba74",
          emissive: 0.9,
          scale: 3.2,
        });
        planetUniforms.push(star.uniforms);
        root.add(
          star.group,
          makeGlow(glowTex, "#fb923c", 12, 0.32),
          makeGlow(glowTex, "#fde68a", 6.5, 0.28),
        );
        // flare streaks
        const flare = makeGlow(glowTex, "#fdba74", 1, 0.3);
        flare.scale.set(26, 0.6, 1);
        root.add(flare);
        scene.add(root);
        animated.push((_t, dt) => (star.body.rotation.y += dt * 0.05));
      }

      /* ── 6. FAQ: asteroid belt around a moon ── */
      {
        const [x, y, z] = ANCHORS[6];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        const moon = makePlanet({
          radius: 1.2,
          colors: ["#1e293b", "#64748b", "#cbd5e1"],
          rim: "#93c5fd",
          atmosphere: "#60a5fa",
          atmosphereStrength: 0.8,
          scale: 4,
        });
        planetUniforms.push(moon.uniforms);
        root.add(moon.group);
        const count = lite ? 140 : 320;
        const rocks = new THREE.InstancedMesh(
          new THREE.DodecahedronGeometry(0.14, 0),
          new THREE.MeshStandardMaterial({
            color: 0x8aa0c8,
            roughness: 0.8,
            flatShading: true,
          }),
          count,
        );
        const rand = rng(77);
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const e = new THREE.Euler();
        const v = new THREE.Vector3();
        const sc = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
          const a = rand() * Math.PI * 2;
          const r = 2.4 + rand() * 1.8;
          v.set(Math.cos(a) * r, (rand() - 0.5) * 0.5, Math.sin(a) * r);
          e.set(rand() * 6, rand() * 6, rand() * 6);
          q.setFromEuler(e);
          const s = 0.4 + rand() * 1.4;
          sc.set(s, s * (0.6 + rand() * 0.6), s);
          m.compose(v, q, sc);
          rocks.setMatrixAt(i, m);
        }
        const belt = new THREE.Group();
        belt.rotation.set(0.45, 0, 0.2);
        belt.add(rocks);
        root.add(belt);
        scene.add(root);
        animated.push((_t, dt) => {
          rocks.rotation.y += dt * 0.06;
          moon.body.rotation.y += dt * 0.05;
        });
      }

      /* ── 7. Join: spiral galaxy finale ── */
      {
        const [x, y, z] = ANCHORS[7];
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.x = 0.5;
        const count = lite ? 4000 : 8000;
        const rand = rng(99);
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const inner = new THREE.Color("#ffe4b5");
        const mid = new THREE.Color("#a78bfa");
        const outer = new THREE.Color("#22d3ee");
        const tmp = new THREE.Color();
        const arms = 3;
        for (let i = 0; i < count; i++) {
          const r = Math.pow(rand(), 1.6) * 14;
          const arm = ((i % arms) / arms) * Math.PI * 2;
          const spin = r * 0.42;
          const jitter =
            Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * (0.4 + r * 0.12);
          const jitterY =
            Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * 0.5 * (1 - r / 16);
          const jitterZ =
            Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * (0.4 + r * 0.12);
          pos[i * 3] = Math.cos(arm + spin) * r + jitter;
          pos[i * 3 + 1] = jitterY;
          pos[i * 3 + 2] = Math.sin(arm + spin) * r + jitterZ;
          const k = r / 14;
          if (k < 0.45) tmp.copy(inner).lerp(mid, k / 0.45);
          else tmp.copy(mid).lerp(outer, (k - 0.45) / 0.55);
          col[i * 3] = tmp.r;
          col[i * 3 + 1] = tmp.g;
          col[i * 3 + 2] = tmp.b;
          size[i] = 0.6 + rand() * 1.6;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
        geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
        const galaxy = new THREE.Points(
          geo,
          new THREE.ShaderMaterial({
            vertexShader: GALAXY_VERT,
            fragmentShader: GALAXY_FRAG,
            uniforms: { uPixelRatio: { value: pixelRatio } },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        root.add(
          galaxy,
          makeGlow(glowTex, "#ffe4b5", 6, 0.9),
          makeGlow(glowTex, "#8b5cf6", 18, 0.35),
        );
        scene.add(root);
        animated.push((_t, dt) => (galaxy.rotation.y += dt * 0.05));
      }

      /* ── Shooting stars ── */
      const shooting = makeGlow(glowTex, "#e0f2fe", 1, 0);
      shooting.scale.set(5, 0.08, 1);
      scene.add(shooting);
      let shootStart = -10;
      let nextShoot = 3;
      const shootFrom = new THREE.Vector3();
      const shootDir = new THREE.Vector3();
      const shootRand = rng(123);

      /* ── Camera poses ── */
      const poses = ANCHORS.map(([x, y, z], i) => {
        // mobile: frame each object so it peeks in from the screen edge, away from the copy
        const side = small ? (i === 0 ? 0.55 : 1.4) : SIDE[i];
        const dist = small ? (i === 0 ? 14 : 16) : i === 0 ? 9.5 : 12.5;
        if (i === ANCHORS.length - 1) {
          return {
            pos: new THREE.Vector3(0, small ? 10 : 7, z + (small ? 22 : 17)),
            look: new THREE.Vector3(x, y, z),
          };
        }
        return {
          pos: new THREE.Vector3(x * side, y + 0.9, z + dist),
          look: new THREE.Vector3(x * side, y - 0.2, z),
        };
      });

      const lastChapter = CHAPTERS.length - 1;

      /* Chapter positions in document coordinates — measured on layout changes, not every frame. */
      let chapterTops: { top: number; height: number }[] = [];
      const measureChapters = () => {
        chapterTops = CHAPTERS.map((c) => {
          const el = document.getElementById(c.id);
          if (!el) return { top: Number.POSITIVE_INFINITY, height: 0 };
          const r = el.getBoundingClientRect();
          return { top: r.top + window.scrollY, height: r.height };
        });
      };
      measureChapters();
      const layoutObserver = new ResizeObserver(measureChapters);
      const main = document.getElementById("main-content");
      if (main) layoutObserver.observe(main);

      const desiredProgress = () => {
        if (viewRef.current !== "home") return VIEW_CHAPTER[viewRef.current];
        // reading line in the upper third: the camera holds on an object while its
        // section fills the screen and flies only through the section's last part
        const mid = window.scrollY + window.innerHeight * 0.3;
        let idx = 0;
        let f = 0;
        for (let i = 0; i < chapterTops.length; i++) {
          const c = chapterTops[i];
          if (c.top <= mid) {
            idx = i;
            f =
              c.height > 0
                ? Math.min(Math.max((mid - c.top) / c.height, 0), 1)
                : 0;
          }
        }
        if (idx >= lastChapter) return lastChapter;
        return idx + (reducedMotion ? (f > 0.8 ? 1 : 0) : smooth(0.62, 1, f));
      };

      const camPos = new THREE.Vector3();
      const camLook = new THREE.Vector3();
      const pointer = new THREE.Vector2();
      const pointerSmooth = new THREE.Vector2();
      const poseAt = (t: number) => {
        const i = Math.min(Math.floor(t), lastChapter);
        const j = Math.min(i + 1, lastChapter);
        const u = t - i;
        camPos.lerpVectors(poses[i].pos, poses[j].pos, u);
        camLook.lerpVectors(poses[i].look, poses[j].look, u);
        // arc the flight so it feels like travelling through space
        const arc = Math.sin(Math.PI * u);
        camPos.y += arc * 2.2;
        camPos.x += arc * (i % 2 === 0 ? -1.5 : 1.5);
      };

      let progress = desiredProgress();
      poseAt(progress);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      /* ── Post-processing (capable desktops only; dropped automatically if frames are slow) ── */
      let composer: EffectComposer | null = null;
      if (!lite) {
        composer = new EffectComposer(renderer);
        composer.setPixelRatio(pixelRatio);
        composer.setSize(window.innerWidth, window.innerHeight);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
            0.55,
            0.45,
            0.42,
          ),
        );
        composer.addPass(new OutputPass());
      }
      const draw = () =>
        composer ? composer.render() : renderer.render(scene, camera);

      /* ── Events ── */
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer?.setSize(window.innerWidth, window.innerHeight);
        dirty = true;
      };
      const onPointer = (e: PointerEvent) => {
        pointer.set(
          e.clientX / window.innerWidth - 0.5,
          e.clientY / window.innerHeight - 0.5,
        );
      };
      window.addEventListener("resize", onResize);
      if (!reducedMotion)
        window.addEventListener("pointermove", onPointer, { passive: true });

      /* ── Loop ── */
      let frame = 0;
      let running = false;
      let dirty = true;
      let time = 0;
      // THREE.Clock is deprecated in favour of THREE.Timer (same delta API,
      // plus it pauses itself while the tab is hidden).
      const timer = new THREE.Timer();
      // adaptive quality: every 90 frames, step down once if the average frame is slower than ~40 fps
      let sampleFrames = 0;
      let sampleTime = 0;
      let qualitySteps = 0;
      const adaptQuality = (rawDt: number) => {
        if (qualitySteps >= 3 || rawDt > 0.25) return; // ignore tab switches / stalls
        sampleFrames++;
        sampleTime += rawDt;
        if (sampleFrames < 90) return;
        const slow = sampleTime / sampleFrames > 1 / 40;
        sampleFrames = 0;
        sampleTime = 0;
        if (!slow) return;
        qualitySteps++;
        if (composer) {
          composer.dispose();
          composer = null;
        } else {
          const next = Math.max(renderer.getPixelRatio() - 0.25, 0.75);
          renderer.setPixelRatio(next);
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };

      /*
       * Low-end devices ("lite") render at ~40fps instead of the display refresh
       * rate. The scene is a slow ambient drift, so the extra frames on a 90/120Hz
       * phone cost battery without being visible.
       */
      let lastDrawAt = 0;
      const minFrameMs = lite ? 1000 / 40 : 0;

      const tick = (now = performance.now()) => {
        frame = requestAnimationFrame(tick);
        timer.update(now);
        const rawDt = timer.getDelta();
        if (minFrameMs) {
          if (now - lastDrawAt < minFrameMs) return;
          lastDrawAt = now;
        }
        const dt = Math.min(rawDt, 0.05);
        if (!reducedMotion) adaptQuality(rawDt);
        // a modal (dialog / panel) is open: the scene is hidden behind it — skip the frame
        if (document.body.hasAttribute("data-scroll-locked")) return;
        const target = desiredProgress();

        if (reducedMotion) {
          if (Math.abs(target - progress) < 1e-3 && !dirty) return;
          progress = target;
        } else {
          time += dt;
          progress += (target - progress) * (1 - Math.exp(-dt * 3.2));
          for (const fn of animated) fn(time, dt);
          for (const u of planetUniforms) u.uTime.value = time;

          // shooting star
          if (time > nextShoot) {
            shootStart = time;
            nextShoot = time + 5 + shootRand() * 7;
            shootFrom.set(
              camera.position.x + (shootRand() - 0.2) * 30,
              camera.position.y + 8 + shootRand() * 6,
              camera.position.z - 25,
            );
            shootDir.set(-1, -0.45, 0).normalize();
          }
          const st = (time - shootStart) / 1.1;
          if (st >= 0 && st <= 1) {
            shooting.position
              .copy(shootFrom)
              .addScaledVector(shootDir, st * 30);
            shooting.material.rotation = Math.atan2(shootDir.y, shootDir.x);
            shooting.material.opacity = Math.sin(st * Math.PI) * 0.9;
          } else {
            shooting.material.opacity = 0;
          }
        }

        pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));
        poseAt(progress);
        camera.position.set(
          camPos.x + pointerSmooth.x * 1.2,
          camPos.y - pointerSmooth.y * 0.7,
          camPos.z,
        );
        camLook.x += pointerSmooth.x * 0.4;
        camLook.y -= pointerSmooth.y * 0.25;
        camera.lookAt(camLook);
        draw();
        dirty = false;
        if (!container.dataset.ready) container.dataset.ready = "true";
      };
      const start = () => {
        if (running || document.hidden) return;
        running = true;
        timer.update(performance.now());
        frame = requestAnimationFrame(tick);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(frame);
      };
      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);

      teardown = () => {
        stop();
        layoutObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointer);
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          const mat = mesh.material as
            THREE.Material | THREE.Material[] | undefined;
          (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => {
            (m as THREE.SpriteMaterial).map?.dispose();
            m.dispose();
          });
        });
        glowTex.dispose();
        composer?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };

      // compile every shader off the main thread where supported, then start drawing
      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        /* older browsers compile on first draw */
      }
      if (cancelled) {
        teardown();
        return;
      }
      start();
    };

    // wait for first paint, then use idle time (or 1.2 s at most)
    type IdleWindow = Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    let idleId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const raf = requestAnimationFrame(() => {
      if (w.requestIdleCallback)
        idleId = w.requestIdleCallback(() => void boot(), { timeout: 1200 });
      else timeoutId = setTimeout(() => void boot(), 300);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (idleId) w.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
      teardown();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="universe-canvas pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-[1500ms] data-[ready=true]:opacity-100"
    />
  );
}
