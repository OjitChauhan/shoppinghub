import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function MovingStreaks() {
  const group = useRef();
  const strips = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        y: 4.8 - i * 0.82,
        z: -6 - i * 0.12,
        speed: 0.08 + i * 0.01,
        opacity: 0.1 + (i % 3) * 0.06,
        width: 16 + i * 0.7,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const t = clock.elapsedTime * strips[i].speed;
      child.position.x = Math.sin(t) * 1.8;
    });
  });

  return (
    <group ref={group} rotation={[0, 0, -0.48]}>
      {strips.map((s, i) => (
        <mesh key={i} position={[0, s.y, s.z]}>
          <planeGeometry args={[s.width, 0.42]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={s.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function HalftoneDots() {
  const dots = useMemo(() => {
    const arr = [];
    for (let x = -7; x < 8; x += 0.5) {
      for (let y = -4; y < 5; y += 0.5) {
        if (x + y > 1.5) {
          arr.push([x, y, -4 - Math.random() * 1.2, 0.01 + Math.random() * 0.035]);
        }
      }
    }
    return arr;
  }, []);

  return (
    <group rotation={[0, 0, -0.43]}>
      {dots.map((d, i) => (
        <mesh key={i} position={[d[0], d[1], d[2]]}>
          <circleGeometry args={[d[3], 8]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

const DarkSportsBackground3D = () => {
  const dark = useDarkMode();
  if (!dark) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 2, 3]} color="#ef4444" intensity={2.4} />
        <pointLight position={[-4, -2, 2]} color="#be123c" intensity={1.8} />
        <MovingStreaks />
        <HalftoneDots />
      </Canvas>
    </div>
  );
};

export default DarkSportsBackground3D;
