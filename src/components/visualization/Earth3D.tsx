'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { Suspense } from 'react';

function EarthSphere() {
  // Note: You'll need to add earth texture images to the public folder
  // For now, we'll use a simple blue sphere
  return (
    <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#4a90e2" />
    </Sphere>
  );
}

interface Earth3DProps {
  asteroidPosition?: [number, number, number];
  impactPoint?: [number, number, number];
  className?: string;
}

export default function Earth3D({ 
  asteroidPosition = [3, 0, 0], 
  impactPoint,
  className = '' 
}: Earth3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Earth */}
          <EarthSphere />
          
          {/* Asteroid */}
          <Sphere args={[0.05, 16, 16]} position={asteroidPosition}>
            <meshStandardMaterial color="#8b4513" emissive="#ff4500" emissiveIntensity={0.2} />
          </Sphere>
          
          {/* Impact point indicator */}
          {impactPoint && (
            <Sphere args={[0.02, 8, 8]} position={impactPoint}>
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
            </Sphere>
          )}
          
          {/* Trajectory line (simplified) */}
          {impactPoint && (
            <mesh>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    asteroidPosition[0], asteroidPosition[1], asteroidPosition[2],
                    impactPoint[0], impactPoint[1], impactPoint[2]
                  ])}
                  itemSize={3}
                  args={[new Float32Array([
                    asteroidPosition[0], asteroidPosition[1], asteroidPosition[2],
                    impactPoint[0], impactPoint[1], impactPoint[2]
                  ]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ffff00" />
            </mesh>
          )}
          
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}