"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Hero background: a calm, pointer-reactive field of points rendered with
 * Three.js. The single "wow" interaction of the site.
 *
 * - Three.js is loaded lazily on the client only.
 * - Renders only while the hero is on screen and the tab is visible.
 * - Lighter grid + lower pixel ratio on small screens.
 * - prefers-reduced-motion: one static frame, no pointer tracking.
 * - If WebGL is unavailable the CSS background behind it stays as-is.
 */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vHeight;
  varying float vGlow;
  varying float vDepth;

  void main() {
    vec3 p = position;
    float wave =
        sin(p.x * 0.32 + uTime * 0.55) * 0.32
      + sin(p.z * 0.48 + uTime * 0.42) * 0.22
      + sin((p.x + p.z) * 0.18 + uTime * 0.30) * 0.38;
    float d = distance(p.xz, uPointer);
    float ripple = exp(-d * d * 0.09) * uPointerStrength;
    p.y += wave + ripple * 1.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + ripple * 1.2) * (10.0 / -mv.z);

    vHeight = clamp((p.y + 0.9) / 2.2, 0.0, 1.0);
    vGlow = ripple;
    vDepth = -mv.z;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform float uNear;
  uniform float uFar;
  varying float vHeight;
  varying float vGlow;
  varying float vDepth;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 color = mix(uColorLow, uColorHigh, vHeight);
    color = mix(color, vec3(1.0), vGlow * 0.3);
    float fade = 1.0 - smoothstep(uNear, uFar, vDepth);
    gl_FragColor = vec4(color, soft * fade * (0.8 + vGlow * 0.2));
  }
`;

export function HeroField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.innerWidth < 768;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch {
        return; // no WebGL — keep the CSS background
      }
      const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
      camera.position.set(0, 2.6, 8.5);
      camera.lookAt(0, 0.6, -3);

      /* Grid of points on the XZ plane */
      const cols = small ? 70 : 140;
      const rows = small ? 44 : 70;
      const spacing = 0.42;
      const positions = new Float32Array(cols * rows * 3);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions[i++] = (c - (cols - 1) / 2) * spacing;
          positions[i++] = 0;
          positions[i++] = 4 - r * spacing;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const uniforms = {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(999, 999) },
        uPointerStrength: { value: 0 },
        uSize: { value: small ? 3.6 : 3.4 },
        uPixelRatio: { value: pixelRatio },
        uColorLow: { value: new THREE.Color("#1d4ed8") }, // brand-700
        uColorHigh: { value: new THREE.Color("#22d3ee") }, // cyber-400
        uNear: { value: 6 },
        uFar: { value: 26 },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      /* Sizing */
      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        renderer.setSize(width, height, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (reducedMotion) renderer.render(scene, camera);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      /* Pointer → point on the field plane */
      const raycaster = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const ndc = new THREE.Vector2();
      const hit = new THREE.Vector3();
      const target = new THREE.Vector2(999, 999);
      let pointerActive = false;

      const onPointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        if (x < 0 || x > 1 || y < 0 || y > 1) {
          pointerActive = false;
          return;
        }
        ndc.set(x * 2 - 1, -(y * 2 - 1));
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          target.set(hit.x, hit.z);
          pointerActive = true;
        }
      };
      const onPointerLeave = () => {
        pointerActive = false;
      };

      /* Render loop — only while visible */
      let frame = 0;
      let running = false;
      let onScreen = true;
      const clock = new THREE.Clock();

      const tick = () => {
        frame = requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.05);
        uniforms.uTime.value += dt;

        // Ease the ripple toward the pointer; let it fade when the pointer leaves.
        const p = uniforms.uPointer.value;
        if (pointerActive) {
          if (p.x > 500) p.copy(target);
          p.lerp(target, 1 - Math.pow(0.001, dt));
        }
        const strengthTarget = pointerActive ? 1 : 0;
        uniforms.uPointerStrength.value +=
          (strengthTarget - uniforms.uPointerStrength.value) * (1 - Math.pow(0.02, dt));

        renderer.render(scene, camera);
      };
      const start = () => {
        if (running || reducedMotion || !onScreen || document.hidden) return;
        running = true;
        clock.getDelta();
        frame = requestAnimationFrame(tick);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(frame);
      };

      const intersection = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      });
      intersection.observe(container);
      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);

      if (reducedMotion) {
        uniforms.uTime.value = 2;
        renderer.render(scene, camera);
      } else {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("pointerleave", onPointerLeave);
        start();
      }

      cleanup = () => {
        stop();
        intersection.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerleave", onPointerLeave);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className={cn("pointer-events-none", className)} />;
}
