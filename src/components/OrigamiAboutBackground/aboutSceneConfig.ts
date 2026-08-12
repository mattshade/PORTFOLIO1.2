import * as THREE from 'three'
import { getAviaryViewportProfile } from '../OrigamiAviaryBackground/constants'

export const ABOUT_COLORS = {
  background: 0x0a0a0b,
  cavernBackground: 0x080c10,
  cavernFog: 0x0b1218,
  greenAccent: 0x7a9a6e,
  greenMuted: 0x4d6350,
  cyanAccent: 0x5ec4dc,
  cyanMuted: 0x3d6a78,
  cyanGlow: 0x7ad4ee,
} as const

export type AboutPhaseConfig = {
  birdCount: number
  sculpturalBirdCount: number
  treeCount: number
  lineOpacity: number
  fogDensity: number
  accentColor: number
  cameraOffsetY: number
  cameraOffsetZ: number
}

export type AboutCavernConfig = {
  batCount: number
  flyingBatCount: number
  stalactiteCount: number
  archCount: number
  lineOpacity: number
  fogDensity: number
  accentColor: number
  batScale: number
  edgeOpacity: number
  ceilingY: number
}

export type AboutTransitionConfig = {
  /** Scroll progress 0–1 where inversion begins / ends */
  start: number
  end: number
  inversionStrength: number
  /** Stage X rotation at full inversion (radians) */
  rotationAmount: number
  cameraDriftY: number
  cameraDriftZ: number
}

export type AboutDescentConfig = {
  maxStageTiltX: number
  entrySinkY: number
  depthSinkY: number
  depthSinkZ: number
  fogDepthBoost: number
  cameraDepthY: number
  cameraDepthZ: number
  cameraEntryY: number
  cameraEntryZ: number
}

export type AboutSceneProfile = {
  upper: AboutPhaseConfig
  transition: AboutTransitionConfig
  descent: AboutDescentConfig
  cavern: AboutCavernConfig
  maxPixelRatio: number
  bloomStrength: number
  scrollRotateIntensity: number
  parallaxIntensity: number
}

export type AboutSceneConfig = {
  desktop: AboutSceneProfile
  mobile: AboutSceneProfile
}

const DESKTOP: AboutSceneProfile = {
  upper: {
    birdCount: 5,
    sculpturalBirdCount: 2,
    treeCount: 12,
    lineOpacity: 0.18,
    fogDensity: 0.012,
    accentColor: ABOUT_COLORS.greenAccent,
    cameraOffsetY: 0.05,
    cameraOffsetZ: -0.4,
  },
  transition: {
    start: 0,
    end: 1,
    inversionStrength: 0.68,
    rotationAmount: Math.PI * 0.24,
    cameraDriftY: -0.52,
    cameraDriftZ: 0.16,
  },
  descent: {
    maxStageTiltX: 0.06,
    entrySinkY: 0.22,
    depthSinkY: 0.48,
    depthSinkZ: 0.28,
    fogDepthBoost: 0.008,
    cameraDepthY: -0.95,
    cameraDepthZ: 0.42,
    cameraEntryY: -0.35,
    cameraEntryZ: 0.12,
  },
  cavern: {
    batCount: 4,
    flyingBatCount: 1,
    stalactiteCount: 28,
    archCount: 8,
    lineOpacity: 0.24,
    fogDensity: 0.016,
    accentColor: ABOUT_COLORS.cyanAccent,
    batScale: 1.35,
    edgeOpacity: 0.62,
    ceilingY: 6.2,
  },
  maxPixelRatio: 1.25,
  bloomStrength: 0.22,
  scrollRotateIntensity: 0.38,
  parallaxIntensity: 0.34,
}

const MOBILE: AboutSceneProfile = {
  upper: {
    birdCount: 2,
    sculpturalBirdCount: 1,
    treeCount: 7,
    lineOpacity: 0.2,
    fogDensity: 0.011,
    accentColor: ABOUT_COLORS.greenAccent,
    cameraOffsetY: 0.08,
    cameraOffsetZ: -0.55,
  },
  transition: {
    start: 0,
    end: 1,
    inversionStrength: 1,
    rotationAmount: Math.PI * 0.5,
    cameraDriftY: -0.58,
    cameraDriftZ: 0.24,
  },
  descent: {
    maxStageTiltX: 0.03,
    entrySinkY: 0.08,
    depthSinkY: 0.42,
    depthSinkZ: 0.28,
    fogDepthBoost: 0.006,
    cameraDepthY: -0.7,
    cameraDepthZ: 0.32,
    cameraEntryY: -0.28,
    cameraEntryZ: 0.1,
  },
  cavern: {
    batCount: 2,
    flyingBatCount: 0,
    stalactiteCount: 16,
    archCount: 5,
    lineOpacity: 0.26,
    fogDensity: 0.015,
    accentColor: ABOUT_COLORS.cyanAccent,
    batScale: 1.42,
    edgeOpacity: 0.65,
    ceilingY: 5.4,
  },
  maxPixelRatio: 1,
  bloomStrength: 0.08,
  scrollRotateIntensity: 0.22,
  parallaxIntensity: 0.2,
}

export const aboutSceneConfig: AboutSceneConfig = {
  desktop: DESKTOP,
  mobile: MOBILE,
}

export function getAboutSceneProfile(width: number): AboutSceneProfile {
  return getAviaryViewportProfile(width) === 'narrow' ? aboutSceneConfig.mobile : aboutSceneConfig.desktop
}

/** Smooth 0–1 blend for transition band (quintic ease — no abrupt mid-scroll snap). */
export function aboutTransitionT(progress: number, cfg: AboutTransitionConfig): number {
  if (progress <= cfg.start) return 0
  if (progress >= cfg.end) return 1
  const u = (progress - cfg.start) / (cfg.end - cfg.start)
  return u * u * u * (u * (u * 6 - 15) + 10)
}

export function lerpAboutColor(a: number, b: number, t: number): number {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  return ca.lerp(cb, t).getHex()
}
