import { useEffect, useMemo, useState } from 'react'
import {
  readAboutVineScrollT,
} from '../OrigamiAboutBackground/homeDescentProgress'
import { computeStalkPanY } from './aboutVineEmbed'
import {
  buildAboutVineStaticScene,
  getAboutDnaStaticArtConfig,
} from './aboutVineStaticGeometry'
import './AboutVineStaticArt.css'

/** SVG vine matching desktop WebGL geometry (no second WebGL context). */
export function AboutVineStaticArt() {
  const cfg = getAboutDnaStaticArtConfig()
  const [scrollT, setScrollT] = useState(() => readAboutVineScrollT())
  const [narrow, setNarrow] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onMq = () => setNarrow(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollT(readAboutVineScrollT())
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.visualViewport?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.visualViewport?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const scene = useMemo(() => {
    const helixPhase = scrollT * cfg.scrollHelixTurns * Math.PI * 2
    const panY = narrow ? 0 : computeStalkPanY(cfg, scrollT)
    return buildAboutVineStaticScene(cfg, helixPhase, panY, narrow)
  }, [cfg, narrow, scrollT])

  return (
    <svg
      className="about-vine-static-art"
      viewBox={scene.viewBox}
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="about-vine-stalk-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5ec4dc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3d6a78" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <g className="about-vine-static-art__stalk" stroke="url(#about-vine-stalk-glow)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {scene.polylines.map((line, i) => (
          <path
            key={`vine-${i}`}
            d={line.d}
            strokeWidth={line.strokeWidth}
            opacity={line.opacity}
          />
        ))}
        {scene.dots.map((dot, i) => (
          <circle
            key={`dot-${i}`}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="#5ec4dc"
            opacity={dot.opacity}
          />
        ))}
      </g>

      <g className="about-vine-static-art__bats" stroke="#5ec4dc" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {scene.bats.map((bat, i) => (
          <g key={`bat-${i}`} opacity={bat.opacity}>
            {bat.paths.map((d, j) => (
              <path key={j} d={d} strokeWidth={1.05} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
