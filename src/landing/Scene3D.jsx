import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, ContactShadows, Environment, Lightformer, Html } from '@react-three/drei';
import { FACTORS, NETWORK, OUTCOME_LADDER, PALETTE, initials, roleColor } from './data.js';

/* ------------------------------------------------------------------ */
/*  Scroll choreography helpers                                        */
/* ------------------------------------------------------------------ */

const damp = THREE.MathUtils.damp;
const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
const smooth = (t) => t * t * (3 - 2 * t);

/** Fractional index of the `[data-scene]` section currently at the viewport centre. */
export function getScrollIndex() {
  const sections = document.querySelectorAll('[data-scene]');
  if (!sections.length) return 0;
  const mid = window.innerHeight / 2;
  const centers = Array.from(sections, (el) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2;
  });
  if (mid <= centers[0]) return 0;
  for (let i = 0; i < centers.length - 1; i++) {
    if (mid >= centers[i] && mid <= centers[i + 1]) {
      return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
    }
  }
  return centers.length - 1;
}

/** Sample a per-section value track at fractional index f. */
const sample = (track, f) => {
  const i = clamp(Math.floor(f), 0, track.length - 1);
  const j = Math.min(i + 1, track.length - 1);
  return lerp(track[i], track[j], smooth(clamp(f - i, 0, 1)));
};

/* Per-section tracks: [ask, manifesto, anatomy, outcomes, declare] */
const LAYOUT = {
  constellation: { p: [1, 0.7, 0, 0, 1], x: [2.0, 0, -1.5, 0, 0], y: [0, 0, 0, 0, 0.15], z: [0, -3, -3, 0, 0], s: [1, 1.15, 0.6, 0.6, 0.85] },
  dial: { p: [0, 0, 1, 0, 0], x: [-2.4, -2.4, -2.35, -2.4, -2.4], y: [-0.2, -0.2, -0.25, 0.4, 0.4], z: [0, 0, 0, 0, 0], s: [1, 1, 1, 1, 1] },
  stairs: { p: [0, 0, 0, 1, 0], x: [2.4, 2.4, 2.4, 2.35, 2.4], y: [-0.9, -0.9, -0.9, -0.95, -0.9], z: [0, 0, 0, 0, 0], s: [1, 1, 1, 1, 1] },
};

/**
 * Drives a group's position/scale/visibility from the scroll tracks.
 * Returns a ref to attach to the group.
 */
function useStage(name) {
  const ref = useRef();
  const presence = useRef(0);
  const { viewport } = useThree();

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const f = getScrollIndex();
    const L = LAYOUT[name];
    const mobile = viewport.width < 6.5;

    presence.current = damp(presence.current, sample(L.p, f), 4, d);
    const p = presence.current;
    const x = mobile ? 0 : sample(L.x, f);
    const y = sample(L.y, f) + (mobile ? 0.9 : 0);
    const s = sample(L.s, f) * (mobile ? 0.58 : 1);

    g.position.x = damp(g.position.x, x, 3.5, d);
    g.position.y = damp(g.position.y, y - (1 - p) * 1.2, 3.5, d);
    g.position.z = damp(g.position.z, sample(L.z, f), 3.5, d);
    g.scale.setScalar(Math.max(0.0001, s * smooth(clamp(p, 0, 1))));
    g.visible = p > 0.01;
  });

  return ref;
}

/* ------------------------------------------------------------------ */
/*  Materials                                                          */
/* ------------------------------------------------------------------ */

const Clay = ({ color, ...props }) => (
  <meshPhysicalMaterial
    color={color}
    roughness={0.55}
    sheen={1}
    sheenRoughness={0.5}
    sheenColor="#ffffff"
    clearcoat={0.35}
    clearcoatRoughness={0.55}
    {...props}
  />
);

const Gloss = ({ color = PALETTE.ink, ...props }) => (
  <meshPhysicalMaterial color={color} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} metalness={0.1} {...props} />
);

const setCursor = (on) => {
  document.body.classList.toggle('lp-hover-3d', on);
};

/* ------------------------------------------------------------------ */
/*  01 — Intent gravity constellation                                  */
/* ------------------------------------------------------------------ */

const BASE = [
  [-2.3, 1.2, -0.6],
  [2.4, 1.0, 0.4],
  [-1.7, -1.4, 0.9],
  [2.1, -1.3, -0.9],
  [0.3, 2.1, -1.3],
  [-0.4, -2.2, -0.5],
];

const UP = new THREE.Vector3(0, 1, 0);
const ORIGIN = new THREE.Vector3();

function ProfileNode({ user, info, isFocus, hasResults, onFocus, nodeRef }) {
  const body = useRef();
  const [hovered, setHovered] = useState(false);
  const color = roleColor(user.role);

  useFrame((_, dt) => {
    const target = isFocus ? 1.45 : hovered ? 1.25 : hasResults && info ? 0.75 + (info.score / 100) * 0.4 : 1;
    const s = damp(body.current.scale.x, target, 6, Math.min(dt, 0.05));
    body.current.scale.setScalar(s);
  });

  return (
    <group ref={nodeRef}>
      <mesh
        ref={body}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setCursor(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          setCursor(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFocus?.(user.id);
        }}
      >
        <sphereGeometry args={[0.34, 64, 64]} />
        <Clay color={color} />
      </mesh>
      <Html center position={[0, 0.72, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`lp3-tag ${isFocus ? 'is-focus' : ''} ${hovered ? 'is-hover' : ''}`}>
          <span className="lp3-tag-dot" style={{ background: color }}>{initials(user.name)}</span>
          <span className="lp3-tag-name">{user.name.split(' ')[0]}</span>
          {hasResults && info && <b>{info.score}</b>}
        </div>
      </Html>
    </group>
  );
}

function Constellation({ results, focusId, onFocus }) {
  const stage = useStage('constellation');
  const spin = useRef();
  const nodes = useRef([]);
  const beam = useRef();
  const pulse = useRef();
  const halo = useRef();

  const infoById = useMemo(() => {
    const map = {};
    (results || []).forEach((r, rank) => (map[r.candidate.id] = { score: r.score, rank }));
    return map;
  }, [results]);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NETWORK.length * 2 * 3), 3));
    return g;
  }, []);

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), dir: new THREE.Vector3(), mid: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const f = getScrollIndex();
    const gather = smooth(clamp(f - 3.2, 0, 1)); // pull everyone in for the final section
    const k = 1 - Math.exp(-3 * d);

    spin.current.rotation.y += d * 0.06;
    halo.current.rotation.z += d * 0.4;

    const pos = lineGeom.attributes.position;
    let focusPos = null;

    NETWORK.forEach((u, i) => {
      const n = nodes.current[i];
      if (!n) return;
      const base = BASE[i];
      tmp.dir.set(base[0], base[1], base[2]).normalize();
      const info = infoById[u.id];
      let radius = Math.hypot(...base);
      if (info) radius = u.id === focusId ? 1.3 : lerp(3.6, 1.9, clamp((info.score - 30) / 69, 0, 1));
      radius = lerp(radius, 1.25, gather);
      tmp.v.copy(tmp.dir).multiplyScalar(radius);
      tmp.v.y += Math.sin(t * 0.9 + i * 1.3) * 0.12;
      n.position.lerp(tmp.v, k);

      pos.setXYZ(i * 2, 0, 0, 0);
      pos.setXYZ(i * 2 + 1, n.position.x, n.position.y, n.position.z);
      if (u.id === focusId) focusPos = n.position;
    });
    pos.needsUpdate = true;
    lineGeom.computeBoundingSphere();

    // Focus beam: a cylinder stretched from "You" to the focused match
    const b = beam.current;
    if (focusPos) {
      const len = focusPos.length();
      tmp.dir.copy(focusPos).normalize();
      b.quaternion.setFromUnitVectors(UP, tmp.dir);
      b.position.copy(focusPos).multiplyScalar(0.5);
      b.scale.set(1, damp(b.scale.y, len, 5, d), 1);
      const ft = (t * 0.6) % 1;
      pulse.current.position.lerpVectors(ORIGIN, focusPos, ft);
      pulse.current.scale.setScalar(Math.sin(ft * Math.PI) + 0.001);
      b.visible = pulse.current.visible = true;
    } else {
      b.visible = pulse.current.visible = false;
    }
  });

  const hasResults = !!(results && results.length);

  return (
    <group ref={stage}>
      <group ref={spin}>
        {/* You */}
        <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0}>
          <mesh>
            <sphereGeometry args={[0.5, 64, 64]} />
            <Gloss />
          </mesh>
          <mesh ref={halo} rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.78, 0.018, 16, 128]} />
            <meshBasicMaterial color={PALETTE.accent} toneMapped={false} />
          </mesh>
          <Html center position={[0, -0.9, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
            <div className="lp3-you">You</div>
          </Html>
        </Float>

        {NETWORK.map((u, i) => (
          <ProfileNode
            key={u.id}
            user={u}
            info={infoById[u.id]}
            isFocus={u.id === focusId}
            hasResults={hasResults}
            onFocus={onFocus}
            nodeRef={(el) => (nodes.current[i] = el)}
          />
        ))}

        <lineSegments geometry={lineGeom}>
          <lineBasicMaterial color={PALETTE.ink} transparent opacity={0.18} />
        </lineSegments>

        <mesh ref={beam}>
          <cylinderGeometry args={[0.028, 0.028, 1, 12]} />
          <meshBasicMaterial color={PALETTE.accent} toneMapped={false} />
        </mesh>
        <mesh ref={pulse}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshBasicMaterial color={PALETTE.accent} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  03 — 3D score dial                                                 */
/* ------------------------------------------------------------------ */

function arcGeometry(start, end, rIn, rOut) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOut, start, end, false);
  s.absarc(0, 0, rIn, end, start, true);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 48,
  });
  return g;
}

function DialSegment({ geometry, color, ratio, active, dimmed, onHover, factorKey }) {
  const mesh = useRef();
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const h = 0.12 + ratio * 1.25;
    mesh.current.scale.z = damp(mesh.current.scale.z, h, 4, d);
    mesh.current.position.y = damp(mesh.current.position.y, active ? 0.18 : 0, 6, d);
  });
  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, 0.12]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(factorKey);
        setCursor(true);
      }}
      onPointerOut={() => {
        onHover?.(null);
        setCursor(false);
      }}
    >
      <Clay color={color} transparent opacity={dimmed ? 0.45 : 1} />
    </mesh>
  );
}

function Dial({ breakdown, score, hoverFactor, onHoverFactor }) {
  const stage = useStage('dial');
  const spin = useRef();

  const segments = useMemo(() => {
    const gap = 0.05;
    let a = Math.PI / 2;
    return FACTORS.map((f) => {
      const span = (f.max / 100) * Math.PI * 2;
      const geo = arcGeometry(a - span + gap / 2, a - gap / 2, 1.05, 2.0);
      a -= span;
      return { ...f, geo };
    });
  }, []);

  useFrame((state, dt) => {
    spin.current.rotation.y = damp(spin.current.rotation.y, state.pointer.x * 0.5 + 0.35, 2, Math.min(dt, 0.05));
  });

  return (
    <group ref={stage}>
      <group rotation={[0.62, 0, 0]}>
        <group ref={spin}>
          {segments.map((s) => (
            <DialSegment
              key={s.key}
              factorKey={s.key}
              geometry={s.geo}
              color={s.color}
              ratio={breakdown ? (breakdown[s.key] || 0) / s.max : 0}
              active={hoverFactor === s.key}
              dimmed={hoverFactor && hoverFactor !== s.key}
              onHover={onHoverFactor}
            />
          ))}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.8, 0.85, 0.5, 64]} />
            <Gloss />
          </mesh>
          <Html center position={[0, 0.95, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
            <div className="lp3-score">{score ?? '—'}</div>
          </Html>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  04 — Outcome staircase                                             */
/* ------------------------------------------------------------------ */

const STAIR_COLORS = [PALETTE.sky, PALETTE.mint, PALETTE.rose, PALETTE.butter, PALETTE.peach, PALETTE.lilac];

function Stairs() {
  const stage = useStage('stairs');
  const ball = useRef();
  const steps = useMemo(
    () =>
      OUTCOME_LADDER.map((o, i) => {
        const h = 0.3 + (o.points / 100) * 2.4;
        return { ...o, h, x: i * 0.66 - 1.65, z: -i * 0.18, color: STAIR_COLORS[i % STAIR_COLORS.length] };
      }),
    []
  );

  useFrame((state) => {
    const n = steps.length;
    const t = state.clock.elapsedTime * 1.15;
    const k = Math.floor(t) % n;
    const u = t % 1;
    const a = steps[k];
    const b = steps[(k + 1) % n];
    const back = k === n - 1;
    const r = 0.16;
    ball.current.position.set(
      lerp(a.x, b.x, u),
      lerp(a.h, b.h, u) + r + Math.sin(u * Math.PI) * (back ? 1.4 : 0.55),
      lerp(a.z, b.z, u)
    );
    const squash = 1 - Math.max(0, 0.18 - Math.sin(u * Math.PI)) * 1.5;
    ball.current.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  });

  return (
    <group ref={stage}>
      <group rotation={[0.18, -0.55, 0]}>
        {steps.map((s) => (
          <group key={s.id} position={[s.x, 0, s.z]}>
            <RoundedBox args={[0.6, s.h, 0.9]} radius={0.08} smoothness={5} position={[0, s.h / 2, 0]}>
              <Clay color={s.color} />
            </RoundedBox>
            <Html center position={[0, s.h + 0.42, 0.3]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
              <div className="lp3-pts">+{s.points}</div>
            </Html>
          </group>
        ))}
        <mesh ref={ball}>
          <sphereGeometry args={[0.16, 48, 48]} />
          <meshPhysicalMaterial color={PALETTE.accent} roughness={0.3} clearcoat={1} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera                                                             */
/* ------------------------------------------------------------------ */

function CameraRig() {
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const c = state.camera;
    c.position.x = damp(c.position.x, state.pointer.x * 0.45, 2, d);
    c.position.y = damp(c.position.y, state.pointer.y * 0.3, 2, d);
    c.lookAt(0, 0, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/*  Canvas                                                             */
/* ------------------------------------------------------------------ */

export default function Scene3D({ results, focusId, onFocus, breakdown, score, hoverFactor, onHoverFactor }) {
  return (
    <Canvas
      className="lp-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 7, 6]} intensity={1.4} color="#fff6ea" />
      <directionalLight position={[-6, -1, -4]} intensity={0.45} color="#ffd9c9" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 6, -6]} scale={[14, 5, 1]} color="#fffaf2" />
        <Lightformer form="circle" intensity={1.4} position={[-7, 1, 3]} scale={5} color="#ffe2d4" />
        <Lightformer form="circle" intensity={1.4} position={[7, 1, 3]} scale={5} color="#e2e9ff" />
      </Environment>

      <CameraRig />
      <Constellation results={results} focusId={focusId} onFocus={onFocus} />
      <Dial breakdown={breakdown} score={score} hoverFactor={hoverFactor} onHoverFactor={onHoverFactor} />
      <Stairs />

      <ContactShadows position={[0, -2.6, 0]} opacity={0.28} scale={16} blur={2.6} far={5} color="#3a2a1a" />
    </Canvas>
  );
}
