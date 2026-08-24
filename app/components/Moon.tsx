'use client';

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * La textura a veces falla en cargar (blip de red/dev-server) y sin este
 * boundary el error escapa del Canvas y tira abajo toda la pagina (la
 * ErrorBoundary interna de r3f solo absorbe el primer throw, no reintentos
 * posteriores). Es un adorno del hero: ante fallo, se omite en silencio en
 * vez de romper el resto del sitio.
 */
class MoonErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Moon: no se pudo cargar la textura, se omite el adorno.', error);
    }
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/**
 * Luna real, no dibujada: esfera de Three.js con la textura fotografica de la
 * Luna (`public/textures/moon-2k.jpg`, NASA via Solar System Scope, licencia
 * CC BY 4.0 — uso comercial permitido, requiere atribucion visible en algun
 * lugar del sitio, ej. footer/creditos) en vez de craters simulados con
 * gradientes. El terminador (limite luz/sombra) lo calcula la luz
 * direccional de verdad, no es un degrade fingido.
 */
function MoonSphere({ spin }: { spin: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, '/textures/moon-2k.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  useFrame((_, delta) => {
    if (spin && meshRef.current) {
      meshRef.current.rotation.y -= delta * 0.13;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0.05, 2.4, 0.12]}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} />
    </mesh>
  );
}

/**
 * El canvas WebGL no se monta hasta el efecto (evita costo en SSR/primer
 * paint) y directamente no se monta en pantallas chicas — es un adorno del
 * hero, no vale la GPU de un telefono de gama baja. Bajo
 * `prefers-reduced-motion` se monta pero congelado (frameloop 'demand', sin
 * rotacion): sigue siendo una luna real, solo que quieta.
 *
 * El tamano del <canvas> lo resuelve @react-three/fiber solo (ResizeObserver
 * interno sobre este contenedor) — es el comportamiento estandar de la
 * libreria, no hace falta manejarlo a mano.
 */
export default function Moon() {
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    setReady(true);
    const syncMotion = () => setReduceMotion(motion.matches);

    syncMotion();
    motion.addEventListener('change', syncMotion);

    return () => {
      motion.removeEventListener('change', syncMotion);
    };
  }, []);

  if (!ready) return null;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.5], fov: 28 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      frameloop="always"
      onCreated={({ gl, scene, camera }) => {
        // Forzar un render inicial para que el loop de RAF arranque de inmediato
        // en mobile, donde los navegadores throttlean RAF hasta la primera
        // interacción del usuario.
        gl.render(scene, camera);
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 1.4, 2.5]} intensity={2.4} color="#fff8ea" />
      <MoonErrorBoundary>
        <Suspense fallback={null}>
          <MoonSphere spin={true} />
        </Suspense>
      </MoonErrorBoundary>
    </Canvas>
  );
}
