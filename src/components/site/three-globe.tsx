"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════
   3D INTERACTIVE GLOBE — premium space-themed globe with:
   • Textured earth-like sphere
   • Glowing atmosphere
   • Floating animation
   • Mouse orbit controls
   • Starfield background
   • Auto-rotation
   ═══════════════════════════════════════════════════════════════════════ */

interface GlobeProps {
  className?: string;
  size?: number;
  rotationSpeed?: number;
  showStars?: boolean;
  showAtmosphere?: boolean;
  autoRotate?: boolean;
}

function GlobeMesh({ rotationSpeed, autoRotate }: { rotationSpeed?: number; autoRotate?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Auto rotation
    if (autoRotate) {
      meshRef.current.rotation.y += rotationSpeed || 0.003;
    }

    // Subtle floating effect
    const floatOffset = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    if (meshRef.current) {
      meshRef.current.position.y = floatOffset;
    }
    if (glowRef.current) {
      glowRef.current.position.y = floatOffset;
    }
  });

  // Create earth-like texture using canvas
  const createEarthTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Base ocean color
    ctx.fillStyle = "#1a4a7a";
    ctx.fillRect(0, 0, 512, 256);

    // Add continents (simplified)
    const continents = [
      // North America
      { x: 150, y: 60, w: 80, h: 60 },
      { x: 170, y: 80, w: 60, h: 40 },
      // South America
      { x: 200, y: 140, w: 40, h: 80 },
      // Europe
      { x: 300, y: 60, w: 50, h: 40 },
      // Africa
      { x: 310, y: 100, w: 50, h: 80 },
      // Asia
      { x: 350, y: 50, w: 100, h: 70 },
      // Australia
      { x: 420, y: 160, w: 40, h: 30 },
    ];

    continents.forEach((c) => {
      ctx.fillStyle = "#2d5a3a";
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add some texture
      ctx.fillStyle = "#3a7a4a";
      ctx.beginPath();
      ctx.ellipse(c.x - 10, c.y - 5, c.w / 4, c.h / 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add some clouds (white patches)
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 256,
        20 + Math.random() * 30,
        10 + Math.random() * 15,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  };

  // Create bump map for 3D effect
  const createBumpTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 128);

    // Add noise for bump effect
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 128;
      const brightness = Math.random() * 50;
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.fillRect(x, y, 2, 2);
    }

    return new THREE.CanvasTexture(canvas);
  };

  // Create atmosphere glow texture
  const createAtmosphereTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(100, 180, 255, 0.3)");
    gradient.addColorStop(0.5, "rgba(100, 180, 255, 0.1)");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
  };

  return (
    <>
      {/* Main globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={createEarthTexture()}
          bumpMap={createBumpTexture()}
          bumpScale={0.02}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Glow layer */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshBasicMaterial
          map={createAtmosphereTexture()}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Point light for illumination */}
      <pointLight position={[5, 5, 5]} intensity={1} color="#4a90d9" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#1a4a7a" />

      {/* Ambient light */}
      <ambientLight intensity={0.4} />
    </>
  );
}

export function ThreeGlobe({
  className,
  size = 300,
  rotationSpeed = 0.003,
  showStars = true,
  showAtmosphere = true,
  autoRotate = true,
}: GlobeProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        cursor: "grab",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#020510"]} />

        {/* Main globe */}
        <GlobeMesh rotationSpeed={rotationSpeed} autoRotate={autoRotate} />

        {/* Stars background */}
        {showStars && <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />}

        {/* Floating animation */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
          <mesh>
            <sphereGeometry args={[1.05, 32, 32]} />
            <meshBasicMaterial
              color="#4a90d9"
              transparent
              opacity={0.1}
              wireframe
            />
          </mesh>
        </Float>

        {/* Orbit controls - limited */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
