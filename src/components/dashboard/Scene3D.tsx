import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars, Icosahedron } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* -----------------------------------------------------------
 * Mount guard — R3F must run client-only
 * --------------------------------------------------------- */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* -----------------------------------------------------------
 * Variant scenes
 * --------------------------------------------------------- */
function OrbScene({ color = "#3b5bff" }: { color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.25;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.2;
  });
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#9ab4ff" />
      <pointLight position={[-4, -2, -3]} intensity={1.2} color={color} />
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.2}>
        <Sphere ref={ref} args={[1.35, 96, 96]}>
          <MeshDistortMaterial
            color={color}
            distort={0.42}
            speed={1.8}
            roughness={0.15}
            metalness={0.55}
          />
        </Sphere>
      </Float>
      <Stars radius={20} depth={30} count={1200} factor={3} fade speed={1} />
    </>
  );
}

function ParticleField({ color = "#6e8bff", count = 1400 }: { color?: string; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 3;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(p) * Math.cos(t);
      a[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      a[i * 3 + 2] = r * Math.cos(p);
    }
    return a;
  }, [count]);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.08;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.2) * 0.15;
  });
  return (
    <>
      <ambientLight intensity={0.4} />
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color={color} transparent opacity={0.9} sizeAttenuation depthWrite={false} />
      </points>
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={0.8}>
        <Icosahedron args={[0.9, 1]}>
          <meshStandardMaterial color={color} wireframe />
        </Icosahedron>
      </Float>
    </>
  );
}

function ShieldScene({ color = "#7c8cff" }: { color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.5;
    if (ring.current) ring.current.rotation.z = -s.clock.elapsedTime * 0.4;
  });
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} intensity={1.5} color={color} />
      <pointLight position={[-3, -2, -3]} intensity={1} color="#ff6b9a" />
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
        <Icosahedron ref={ref} args={[1.2, 1]}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} wireframe={false} flatShading />
        </Icosahedron>
      </Float>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.9, 0.015, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Stars radius={15} depth={20} count={800} factor={2} fade speed={0.8} />
    </>
  );
}

/* -----------------------------------------------------------
 * Hero canvas wrapper
 * --------------------------------------------------------- */
export function Scene3D({
  variant = "orb",
  color,
  height = 220,
}: {
  variant?: "orb" | "particles" | "shield";
  color?: string;
  height?: number;
}) {
  const mounted = useMounted();
  if (!mounted) return <div style={{ height }} className="rounded-2xl bg-foreground/5" />;
  return (
    <div style={{ height }} className="relative w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {variant === "orb" && <OrbScene color={color} />}
          {variant === "particles" && <ParticleField color={color} />}
          {variant === "shield" && <ShieldScene color={color} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
