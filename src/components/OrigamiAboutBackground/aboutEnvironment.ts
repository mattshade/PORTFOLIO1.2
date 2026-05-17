import * as THREE from 'three'
import type { OrigamiAviaryTuning } from '../OrigamiAviaryBackground/constants'
import { DEFAULT_AVIARY_TUNING, getResponsiveAviaryTuning } from '../OrigamiAviaryBackground/constants'
import { buildAviaryEnvironment } from '../OrigamiAviaryBackground/environment'
import { buildAviaryAtmosphere } from '../OrigamiAviaryBackground/atmosphere'
import { buildCavernStructures } from './cavernStructures'
import { buildCavernAtmosphere, type CavernAtmosphereSystem } from './cavernAtmosphere'
import type { AboutSceneProfile } from './aboutSceneConfig'
import { ABOUT_COLORS } from './aboutSceneConfig'
import type { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type AboutWorldBundle = {
  upper: THREE.Group
  cavern: THREE.Group
  depthLayers: THREE.Group[]
  roots: THREE.Object3D[]
  perches: ReturnType<typeof buildAviaryEnvironment>['perches']
  batPerches: ReturnType<typeof buildCavernStructures>
  tuning: OrigamiAviaryTuning
  profile: AboutSceneProfile
}

export function tuningForAboutUpper(profile: AboutSceneProfile): OrigamiAviaryTuning {
  const base = getResponsiveAviaryTuning()
  const u = profile.upper
  return {
    ...DEFAULT_AVIARY_TUNING,
    ...base,
    birdCount: u.birdCount,
    sculpturalBirdCount: u.sculpturalBirdCount,
    treeCount: u.treeCount,
    lineOpacity: u.lineOpacity,
    fogDensity: u.fogDensity,
    accentColor: u.accentColor,
    cameraOffsetY: u.cameraOffsetY,
    cameraOffsetZ: u.cameraOffsetZ,
    posterComposition: true,
    maxPixelRatio: profile.maxPixelRatio,
    bloomStrength: profile.bloomStrength,
    scrollRotateIntensity: profile.scrollRotateIntensity,
    parallaxIntensity: profile.parallaxIntensity,
  }
}

export function buildAboutWorld(
  world: THREE.Object3D,
  stage: THREE.Object3D,
  rng: Rng,
  profile: AboutSceneProfile,
): AboutWorldBundle {
  const tuning = tuningForAboutUpper(profile)
  const upper = new THREE.Group()
  upper.name = 'about-upper'
  world.add(upper)

  const accent = new THREE.Color(tuning.accentColor)
  const env = buildAviaryEnvironment(upper, rng, tuning, accent, { includeCat: false })
  buildAviaryAtmosphere(stage, rng, tuning, accent)

  const cavern = new THREE.Group()
  cavern.name = 'about-cavern'
  world.add(cavern)

  const cyan = new THREE.Color(profile.cavern.accentColor)
  const cyanMuted = new THREE.Color(ABOUT_COLORS.cyanMuted)
  const batPerches = buildCavernStructures(
    cavern,
    rng,
    profile.cavern,
    tuning.sceneDepth,
    cyan,
    cyanMuted,
    env.roots,
  )

  return {
    upper,
    cavern,
    depthLayers: env.depthLayers,
    roots: env.roots,
    perches: env.perches,
    batPerches,
    tuning,
    profile,
  }
}

/** Cavern layer for the homepage: stalactites + bat perches under the existing aviary `world`. */
export function buildCavernLayer(
  world: THREE.Group,
  rng: Rng,
  profile: AboutSceneProfile,
  sceneDepth: number,
  roots: THREE.Object3D[],
): {
  cavern: THREE.Group
  batPerches: ReturnType<typeof buildCavernStructures>
  cavernAtmosphere: CavernAtmosphereSystem
} {
  const cavern = new THREE.Group()
  cavern.name = 'about-cavern'
  cavern.visible = false
  cavern.position.set(0, 0.35, -1.2)
  world.add(cavern)

  const cyan = new THREE.Color(profile.cavern.accentColor)
  const cyanMuted = new THREE.Color(ABOUT_COLORS.cyanMuted)
  const batPerches = buildCavernStructures(
    cavern,
    rng,
    profile.cavern,
    sceneDepth,
    cyan,
    cyanMuted,
    roots,
  )

  const cavernAtmosphere = buildCavernAtmosphere(cavern, rng, profile.cavern, sceneDepth, roots)

  return { cavern, batPerches, cavernAtmosphere }
}
