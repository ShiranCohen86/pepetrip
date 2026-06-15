/* eslint-disable react/no-unknown-property -- react-three-fiber uses three.js props (args, position, intensity…) on its intrinsic elements. */
import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Vector3, Quaternion } from 'three';
import ThreeGlobe from 'three-globe';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../hooks/responsive';
import countriesGeo from './world-countries.json';

const UP = new Vector3(0, 1, 0);

// Bright "desk globe" palette — each country gets a stable colour from it.
const PALETTE = [
  '#f4d35e', '#ee964b', '#7fb069', '#90be6d', '#f9c74f', '#f8961e',
  '#e76f51', '#83c5be', '#bc96e6', '#a3c4f3', '#ffb4a2', '#b5e48c',
];

const STATUS_COLOR = {
  completed: '#10b981',
  active: '#0ea5e9',
  planned: '#f59e0b',
  draft: '#f59e0b',
};
const STATUS_LABEL = { completed: 'Completed', active: 'Active', planned: 'Planned', draft: 'Draft' };

/** Build the three-globe instance once: light-blue ocean + colour-filled countries. */
function makeGlobe() {
  const colorByFeature = new Map();
  countriesGeo.features.forEach((f, i) => colorByFeature.set(f, PALETTE[i % PALETTE.length]));
  const g = new ThreeGlobe({ animateIn: false })
    .polygonsData(countriesGeo.features)
    .polygonCapColor((f) => colorByFeature.get(f) || '#cccccc')
    .polygonSideColor(() => 'rgba(0,40,80,0.12)')
    .polygonStrokeColor(() => '#2a3b4d')
    .polygonAltitude(0.007)
    .showAtmosphere(true)
    .atmosphereColor('#9ec5ff')
    .atmosphereAltitude(0.16);
  g.globeMaterial().color.set('#a8d5f0'); // light blue ocean
  return g;
}

function Pin({ pos, radius, point, hovered, onHover, onSelect, occluderRef }) {
  const color = STATUS_COLOR[point.status] ?? '#0ea5e9';
  const quaternion = useMemo(
    () => new Quaternion().setFromUnitVectors(UP, new Vector3(...pos).normalize()),
    [pos],
  );
  const place = point.country || point.city || point.label;
  const coneH = radius * 0.08;
  const headR = radius * 0.03;

  return (
    <group
      position={pos}
      quaternion={quaternion}
      scale={hovered ? 1.25 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(point.tripId);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(point.tripId);
      }}
    >
      <mesh position={[0, coneH / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius * 0.022, coneH, 18]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, coneH + headR * 0.6, 0]}>
        <sphereGeometry args={[headR, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} emissive={color} emissiveIntensity={0.25} />
      </mesh>

      <Html
        position={[0, coneH + headR * 2.6, 0]}
        center
        occlude={occluderRef ? [occluderRef] : undefined}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            transform: 'translateY(-50%)',
            background: hovered ? 'rgba(11,16,32,0.95)' : 'rgba(11,16,32,0.78)',
            color: '#fff',
            padding: hovered ? '7px 11px' : '3px 9px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            fontSize: hovered ? 12 : 11,
            lineHeight: 1.35,
            textAlign: 'center',
            boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontWeight: 700 }}>{place}</div>
          {hovered && (
            <>
              <div style={{ opacity: 0.8 }}>{point.title}</div>
              <div style={{ marginTop: 2, opacity: 0.9 }}>
                {STATUS_LABEL[point.status] ?? point.status}
                <span style={{ opacity: 0.55, marginInlineStart: 8 }}>open trip →</span>
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

function World({ points, onSelect }) {
  const group = useRef();
  const occluder = useRef();
  const [hoveredId, setHoveredId] = useState(null);
  const globe = useMemo(makeGlobe, []);
  const radius = globe.getGlobeRadius();

  useFrame((_, delta) => {
    if (group.current && !hoveredId) group.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group} rotation={[0.3, 0, 0]}>
      <primitive object={globe} />

      {/* Invisible occluder: blocks hover/click and hides labels on the far side. */}
      <mesh
        ref={occluder}
        onPointerMove={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {points.map((p) => {
        const c = globe.getCoords(p.coords.lat, p.coords.lng, 0);
        return (
          <Pin
            key={p.tripId}
            pos={[c.x, c.y, c.z]}
            radius={radius}
            point={p}
            hovered={hoveredId === p.tripId}
            onHover={setHoveredId}
            onSelect={onSelect}
            occluderRef={occluder}
          />
        );
      })}
    </group>
  );
}

export function Globe({ points = [] }) {
  const { isTouch } = usePlatform();
  const navigate = useNavigate();
  const placed = points.filter((p) => p?.coords?.lat != null);
  const dpr = isTouch ? [1, 1.5] : [1, 2];
  const onSelect = (tripId) => {
    if (tripId) navigate(`/trips/${tripId}`);
  };

  // three-globe's default radius is 100, so frame the camera for that scale.
  return (
    <Canvas
      camera={{ position: [0, 0, 260], fov: 45, near: 1, far: 2000 }}
      dpr={dpr}
      gl={{ antialias: !isTouch, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[200, 120, 200]} intensity={0.65} />
      <World points={placed} onSelect={onSelect} />
      <OrbitControls enablePan={false} enableZoom minDistance={160} maxDistance={420} />
    </Canvas>
  );
}
