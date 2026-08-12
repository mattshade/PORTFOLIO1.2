import * as THREE from 'three'
import { createLineBatch, flushLineBatch } from '../OrigamiAviaryBackground/lineBatch'

function seg(batch: { positions: number[] }, ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  batch.positions.push(ax, ay, az, bx, by, bz)
}

export type BatRig = {
  root: THREE.Group
  body: THREE.Group
  wingL: THREE.Group
  wingR: THREE.Group
  lines: THREE.Object3D[]
}

export function createOrigamiBat(
  accent: THREE.Color,
  muted: THREE.Color,
  lineOpacity: number,
  lineWidth: number,
  sceneDepth: number,
  roots: THREE.Object3D[],
  options?: { lineColor?: THREE.Color; fog?: boolean; depthFade?: number },
): BatRig {
  const color = options?.lineColor ?? accent.clone().lerp(muted, 0.45)
  const lineOpts = { depthFade: options?.depthFade ?? 0, fog: options?.fog ?? false }
  const rig: BatRig = {
    root: new THREE.Group(),
    body: new THREE.Group(),
    wingL: new THREE.Group(),
    wingR: new THREE.Group(),
    lines: [],
  }

  rig.wingL.position.set(-0.06, 0.02, 0)
  rig.wingR.position.set(0.06, 0.02, 0)
  rig.body.add(rig.wingL, rig.wingR)
  rig.root.add(rig.body)

  const bodyBatch = createLineBatch(lineOpacity)
  seg(bodyBatch, 0, 0.05, 0.02, -0.07, 0.11, -0.02)
  seg(bodyBatch, -0.07, 0.11, -0.02, 0.07, 0.11, -0.02)
  seg(bodyBatch, 0.07, 0.11, -0.02, 0, 0.05, 0.02)
  seg(bodyBatch, 0, 0.03, 0.08, 0, 0.14, 0.12)
  flushLineBatch(bodyBatch, rig.body, color, roots, sceneDepth, lineWidth * 1.05, lineOpts)

  const wing = (parent: THREE.Group, sx: number) => {
    const b = createLineBatch(lineOpacity * 0.95)
    seg(b, 0, 0, 0, sx * 0.48, 0.03, 0.05)
    seg(b, sx * 0.48, 0.03, 0.05, sx * 0.64, 0.11, -0.08)
    seg(b, sx * 0.64, 0.11, -0.08, sx * 0.34, 0.05, -0.13)
    seg(b, sx * 0.34, 0.05, -0.13, 0, 0, 0)
    seg(b, sx * 0.48, 0.03, 0.05, sx * 0.28, -0.03, 0.03)
    flushLineBatch(b, parent, color, roots, sceneDepth, lineWidth * 0.95, lineOpts)
  }

  wing(rig.wingL, -1)
  wing(rig.wingR, 1)

  rig.root.traverse((o) => {
    if (o !== rig.root) rig.lines.push(o)
  })

  return rig
}

/** Upside-down perch: feet toward ceiling */
export function applyBatHangPose(rig: BatRig, wingPhase: number) {
  rig.root.rotation.x = Math.PI
  const fold = 0.35 + Math.sin(wingPhase) * 0.08
  rig.wingL.rotation.z = fold
  rig.wingR.rotation.z = -fold
  rig.body.rotation.x = 0.12
}

export function applyBatGlidePose(rig: BatRig, u: number, wingPhase: number) {
  rig.root.rotation.x = Math.PI * 0.92 + u * 0.15
  const flap = Math.sin(wingPhase * 2.2) * 0.12
  rig.wingL.rotation.z = 0.55 + flap
  rig.wingR.rotation.z = -0.55 - flap
  rig.body.rotation.x = 0.05 + u * 0.08
}
