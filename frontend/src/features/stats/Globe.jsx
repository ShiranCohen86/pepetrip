/* eslint-disable react/no-unknown-property -- react-three-fiber uses three.js props (args, position, intensity…) on its intrinsic elements. */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const R = 2;

/** Convert latitude/longitude to a point on a sphere of radius r. */
function latLngToVec3(lat, lng, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

const STATUS_COLOR = {
  completed: '#10b981',
  active: '#0ea5e9',
  planned: '#f59e0b',
  draft: '#f59e0b',
};

function Pin({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function World({ points }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={group} rotation={[0.3, 0, 0]}>
      {/* Ocean sphere */}
      <mesh>
        <sphereGeometry args={[R, 48, 48]} />
        <meshStandardMaterial color="#0b2a4a" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Lat/long wireframe overlay */}
      <mesh>
        <sphereGeometry args={[R * 1.001, 24, 24]} />
        <meshBasicMaterial color="#1f4e79" wireframe transparent opacity={0.35} />
      </mesh>
      {points.map((p) => (
        <Pin
          key={p.tripId}
          position={latLngToVec3(p.coords.lat, p.coords.lng, R * 1.02)}
          color={STATUS_COLOR[p.status] ?? '#0ea5e9'}
        />
      ))}
    </group>
  );
}

export function Globe({ points = [] }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} />
      <World points={points} />
      <OrbitControls enablePan={false} enableZoom minDistance={3.2} maxDistance={8} />
    </Canvas>
  );
}
