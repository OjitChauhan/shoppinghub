/**
 * HeroBackground3D.jsx
 * Animated React Three Fiber background for the Home page.
 * Features: floating glowing orbs, rotating torus knot, drifting particles.
 * Adapts colors to dark/light mode.
 */
import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

/* ── Detect dark mode reactively ── */
function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/* ── Floating particle field ── */
function StarField({ count = 900, dark }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.03;
      ref.current.rotation.y += dt * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={dark ? "#F97316" : "#F59E0B"}
        size={0.055}
        sizeAttenuation
        depthWrite={false}
        opacity={dark ? 0.65 : 0.45}
      />
    </Points>
  );
}

/* ── Glowing orb ── */
function GlowOrb({ position, color, speed = 1, distort = 0.4, radius = 1.2 }) {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.8}>
      <Sphere args={[radius, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={3}
          roughness={0}
          metalness={0.2}
          transparent
          opacity={0.18}
        />
      </Sphere>
    </Float>
  );
}

/* ── Rotating accent ring ── */
function SpinRing({ dark }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.25;
      ref.current.rotation.z += dt * 0.18;
    }
  });
  return (
    <mesh ref={ref} position={[3, -1, -5]}>
      <torusKnotGeometry args={[1.1, 0.28, 160, 32]} />
      <meshStandardMaterial
        color={dark ? "#EF4444" : "#F97316"}
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

/* ── Camera drift ── */
function CameraDrift() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    camera.position.x = Math.sin(clock.elapsedTime * 0.12) * 0.6;
    camera.position.y = Math.cos(clock.elapsedTime * 0.09) * 0.4;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ── Scene ── */
function Scene({ dark }) {
  const bg = dark ? "#05091A" : "#FFFFFF";
  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]}   color={dark ? "#F97316" : "#FBBF24"} intensity={3} />
      <pointLight position={[-6, -4, -6]} color={dark ? "#EF4444" : "#FB923C"} intensity={2} />

      <StarField count={800} dark={dark} />

      {/* Orbs */}
      <GlowOrb position={[-4,  2, -6]} color={dark ? "#F97316" : "#FBBF24"} speed={1.2} distort={0.5} radius={2.0} />
      <GlowOrb position={[ 5, -2, -8]} color={dark ? "#EF4444" : "#FB923C"} speed={0.8} distort={0.35} radius={1.6} />
      <GlowOrb position={[ 0,  4, -10]} color={dark ? "#7C3AED" : "#A78BFA"} speed={0.6} distort={0.6} radius={3.0} />

      <SpinRing dark={dark} />
      <CameraDrift />
    </>
  );
}

/* ── Exported component ── */
const HeroBackground3D = () => {
  const dark = useDarkMode();
  return (
    <div className="absolute inset-0 -z-10 w-full h-full pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene dark={dark} />
      </Canvas>
    </div>
  );
};

export default HeroBackground3D;
