import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, Lightformer, Environment } from '@react-three/drei';

const damp = THREE.MathUtils.damp;
const lerp = THREE.MathUtils.lerp;

const ROLE_PALETTE = {
  Founder: '#FF9E80',
  Developer: '#82B1FF',
  Designer: '#FF80AB',
  'Recruiter / HR': '#B9F6CA',
  Investor: '#FFE57F',
  Freelancer: '#CCB6FF',
};

function getRoleColor(role) {
  return ROLE_PALETTE[role] || '#82B1FF';
}

function CandidateNode({ candidate, score, angle, radius, isSelected, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const color = getRoleColor(candidate.role);

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const d = Math.min(dt, 0.05);
    const targetScale = isSelected ? 1.35 : hovered ? 1.2 : 0.95 + (score / 100) * 0.2;
    const s = damp(meshRef.current.scale.x, targetScale, 7, d);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <group position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.25, Math.sin(angle) * radius]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(candidate.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = '';
          }}
        >
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.15}
            emissive={isSelected ? color : '#000000'}
            emissiveIntensity={isSelected ? 0.35 : 0}
          />
        </mesh>

        <Html center position={[0, 0.55, 0]} zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`dash3d-node-pill ${isSelected ? 'is-selected' : ''} ${hovered ? 'is-hover' : ''}`}>
            <span className="dash3d-dot" style={{ backgroundColor: color }} />
            <span className="dash3d-name">{candidate.name.split(' ')[0]}</span>
            <b className="dash3d-score">{score}%</b>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function RadarScene({ currentUser, topMatches, selectedId, onSelectCandidate }) {
  const rig = useRef();
  const ringA = useRef();
  const ringB = useRef();
  const laserGeom = useMemo(() => new THREE.BufferGeometry(), []);
  const pulseRef = useRef();

  // Distribute candidate nodes on orbital rings
  const nodesData = useMemo(() => {
    return topMatches.slice(0, 5).map((m, idx) => {
      const angle = (idx / Math.min(topMatches.length, 5)) * Math.PI * 2 + 0.4;
      const radius = 1.9 + (1 - m.score / 100) * 1.0;
      return {
        ...m,
        angle,
        radius,
      };
    });
  }, [topMatches]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const px = state.pointer.x;
    const py = state.pointer.y;

    if (rig.current) {
      rig.current.rotation.y = damp(rig.current.rotation.y, px * 0.45 + state.clock.elapsedTime * 0.04, 3, d);
      rig.current.rotation.x = damp(rig.current.rotation.x, -py * 0.25 + 0.2, 3, d);
    }

    if (ringA.current) ringA.current.rotation.z += d * 0.15;
    if (ringB.current) ringB.current.rotation.z -= d * 0.22;

    // Update active laser beam to selected candidate
    const selected = nodesData.find((n) => n.candidate.id === selectedId) || nodesData[0];
    if (selected && pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.8) % 1;
      const targetPos = new THREE.Vector3(
        Math.cos(selected.angle) * selected.radius,
        Math.sin(selected.angle * 2) * 0.25,
        Math.sin(selected.angle) * selected.radius
      );
      pulseRef.current.position.lerpVectors(new THREE.Vector3(0, 0, 0), targetPos, t);
      pulseRef.current.scale.setScalar(Math.sin(t * Math.PI) * 0.8 + 0.2);
    }
  });

  return (
    <group ref={rig}>
      {/* Central "Your Intent" Core */}
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[0.55, 3]} />
          <meshPhysicalMaterial
            color="#6366F1"
            roughness={0.15}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Orbiting Concentric Energy Rings */}
        <mesh ref={ringA} rotation={[Math.PI / 2.3, 0.2, 0]}>
          <torusGeometry args={[0.9, 0.015, 16, 80]} />
          <meshBasicMaterial color="#A5B4FC" transparent opacity={0.65} />
        </mesh>
        <mesh ref={ringB} rotation={[-Math.PI / 2.1, -0.4, 0]}>
          <torusGeometry args={[1.2, 0.01, 16, 80]} />
          <meshBasicMaterial color="#C7D2FE" transparent opacity={0.4} />
        </mesh>

        <Html center position={[0, -0.9, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="dash3d-you-badge">
            <span>Your Intent</span>
          </div>
        </Html>
      </Float>

      {/* Orbiting Match Candidates */}
      {nodesData.map((node) => (
        <CandidateNode
          key={node.candidate.id}
          candidate={node.candidate}
          score={node.score}
          angle={node.angle}
          radius={node.radius}
          isSelected={node.candidate.id === selectedId}
          onSelect={onSelectCandidate}
        />
      ))}

      {/* Laser synergy particle */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#818CF8" toneMapped={false} />
      </mesh>
    </group>
  );
}

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('DashboardRadar3D WebGL context fallback:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function RadarFallback2D({ currentUser, topMatches, selectedId, onSelectCandidate }) {
  return (
    <div className="dash3d-fallback-orbit">
      <div className="dash3d-fallback-ring ring-outer" />
      <div className="dash3d-fallback-ring ring-inner" />
      <div className="dash3d-fallback-center">
        <span>You</span>
      </div>
      {topMatches.slice(0, 5).map((m, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 110;
        const y = Math.sin(angle) * 85;
        const color = getRoleColor(m.candidate.role);
        return (
          <button
            key={m.candidate.id}
            type="button"
            className={`dash3d-node-pill ${selectedId === m.candidate.id ? 'is-selected' : ''}`}
            style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px)`,
              cursor: 'pointer',
            }}
            onClick={() => onSelectCandidate(m.candidate.id)}
          >
            <span className="dash3d-dot" style={{ backgroundColor: color }} />
            <span className="dash3d-name">{m.candidate.name.split(' ')[0]}</span>
            <b className="dash3d-score">{m.score}%</b>
          </button>
        );
      })}
    </div>
  );
}

export default function DashboardRadar3D({ currentUser, topMatches, selectedId, onSelectCandidate }) {
  return (
    <div className="dash3d-container">
      <CanvasErrorBoundary
        fallback={
          <RadarFallback2D
            currentUser={currentUser}
            topMatches={topMatches}
            selectedId={selectedId}
            onSelectCandidate={onSelectCandidate}
          />
        }
      >
        <Canvas
          camera={{ position: [0, 1.2, 5.2], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[4, 6, 5]} intensity={1.2} color="#FFFFFF" />
          <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#C7D2FE" />
          <RadarScene
            currentUser={currentUser}
            topMatches={topMatches}
            selectedId={selectedId}
            onSelectCandidate={onSelectCandidate}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <div className="dash3d-hint">
        <span>✦ Interactive 3D Intent Radar — click a node to inspect</span>
      </div>
    </div>
  );
}
