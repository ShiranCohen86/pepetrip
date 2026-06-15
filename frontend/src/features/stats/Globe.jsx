/* eslint-disable react/no-unknown-property -- react-three-fiber uses three.js props (args, position, intensity…) on its intrinsic elements. */
import { useRef, useState, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../hooks/responsive';

const R = 2;
// NASA "blue marble" equirectangular map (CORS-enabled CDN; CSP allows https img).
// Falls back to a plain ocean sphere if it can't load (offline / blocked).
const EARTH_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg';

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
const STATUS_LABEL = {
  completed: 'Completed',
  active: 'Active',
  planned: 'Planned',
  draft: 'Draft',
};

/** Earth with the photographic texture (suspends while the image loads). */
function TexturedEarth() {
  const map = useTexture(EARTH_TEXTURE);
  return (
    <mesh>
      <sphereGeometry args={[R, 64, 64]} />
      {/* Basic (unlit) so the whole globe stays bright and readable as it spins. */}
      <meshBasicMaterial map={map} />
    </mesh>
  );
}

/** Plain ocean sphere — shown while the texture loads or if it fails. */
function PlainEarth() {
  return (
    <mesh>
      <sphereGeometry args={[R, 48, 48]} />
      <meshStandardMaterial color="#15467a" roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

/** Degrade to the plain sphere if the texture throws (network/CORS). */
class TextureBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Pin({ point, hovered, onHover, onSelect }) {
  const color = STATUS_COLOR[point.status] ?? '#0ea5e9';
  return (
    <group position={latLngToVec3(point.coords.lat, point.coords.lng, R * 1.02)}>
      <mesh
        scale={hovered ? 1.7 : 1}
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
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {hovered && (
        <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              transform: 'translateY(-150%)',
              background: 'rgba(11,16,32,0.94)',
              color: '#fff',
              padding: '7px 11px',
              borderRadius: 12,
              whiteSpace: 'nowrap',
              fontSize: 12,
              lineHeight: 1.35,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontWeight: 700 }}>{point.title}</div>
            {point.label && <div style={{ opacity: 0.8 }}>{point.label}</div>}
            <div style={{ marginTop: 3, opacity: 0.9 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: color,
                  marginInlineEnd: 5,
                  verticalAlign: 'middle',
                }}
              />
              {STATUS_LABEL[point.status] ?? point.status}
              <span style={{ opacity: 0.55, marginInlineStart: 8 }}>· open trip →</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function World({ points, onSelect }) {
  const group = useRef();
  const [hoveredId, setHoveredId] = useState(null);
  // Spin gently, but hold still while a pin is hovered so it's easy to click.
  useFrame((_, delta) => {
    if (group.current && !hoveredId) group.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group} rotation={[0.3, 0, 0]}>
      <TextureBoundary fallback={<PlainEarth />}>
        <Suspense fallback={<PlainEarth />}>
          <TexturedEarth />
        </Suspense>
      </TextureBoundary>

      {/* Invisible occluder: blocks hover/click of pins on the far side of the globe. */}
      <mesh
        onPointerMove={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Soft atmosphere halo. */}
      <mesh>
        <sphereGeometry args={[R * 1.04, 32, 32]} />
        <meshBasicMaterial color="#7cc4ff" transparent opacity={0.08} side={1} />
      </mesh>

      {points.map((p) => (
        <Pin
          key={p.tripId}
          point={p}
          hovered={hoveredId === p.tripId}
          onHover={setHoveredId}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

export function Globe({ points = [] }) {
  const { isTouch } = usePlatform();
  const navigate = useNavigate();
  // Only plot pins that actually have coordinates.
  const placed = points.filter((p) => p?.coords?.lat != null);
  // Cap pixel ratio and skip antialiasing on touch / low-end GPUs to keep the
  // auto-rotating canvas smooth without draining the battery.
  const dpr = isTouch ? [1, 1.5] : [1, 2];
  const onSelect = (tripId) => {
    if (tripId) navigate(`/trips/${tripId}`);
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: !isTouch, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <World points={placed} onSelect={onSelect} />
      <OrbitControls enablePan={false} enableZoom minDistance={3.2} maxDistance={8} />
    </Canvas>
  );
}
