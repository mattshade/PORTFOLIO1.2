import { useEffect, useRef } from 'react'

class Boid {
  x: number
  y: number
  vx: number
  vy: number
  maxSpeed: number
  maxForce: number
  index: number
  drawSeed: number
  isLanded: boolean
  landX: number
  landY: number

  constructor(x: number, y: number, index: number) {
    this.x = x
    this.y = y
    this.drawSeed = Math.random()
    this.isLanded = false
    this.landX = 0
    this.landY = 0
    this.vx = (Math.random() * 2 - 1) * 2
    this.vy = (Math.random() * 2 - 1) * 2
    this.maxSpeed = 2.0
    this.maxForce = 0.04
    this.index = index
  }

  edges(width: number, height: number) {
    if (this.x > width + 20) this.x = -20
    if (this.x < -20) this.x = width + 20
    if (this.y > height + 20) this.y = -20
    if (this.y < -20) this.y = height + 20
  }

  align(boids: Boid[]) {
    let perceptionRadius = 28
    let steeringX = 0
    let steeringY = 0
    let total = 0
    for (let other of boids) {
      if (other !== this) {
        let d = Math.hypot(this.x - other.x, this.y - other.y)
        if (d < perceptionRadius) {
          steeringX += other.vx
          steeringY += other.vy
          total++
        }
      }
    }
    if (total > 0) {
      steeringX /= total
      steeringY /= total
      let mag = Math.hypot(steeringX, steeringY)
      if (mag > 0) {
        steeringX = (steeringX / mag) * this.maxSpeed
        steeringY = (steeringY / mag) * this.maxSpeed
      }
      steeringX -= this.vx
      steeringY -= this.vy
      let steerMag = Math.hypot(steeringX, steeringY)
      if (steerMag > this.maxForce) {
        steeringX = (steeringX / steerMag) * this.maxForce
        steeringY = (steeringY / steerMag) * this.maxForce
      }
    }
    return { x: steeringX, y: steeringY }
  }

  cohesion(boids: Boid[]) {
    let perceptionRadius = 28
    let steeringX = 0
    let steeringY = 0
    let total = 0
    for (let other of boids) {
      if (other !== this) {
        let d = Math.hypot(this.x - other.x, this.y - other.y)
        if (d < perceptionRadius) {
          steeringX += other.x
          steeringY += other.y
          total++
        }
      }
    }
    if (total > 0) {
      steeringX /= total
      steeringY /= total
      steeringX -= this.x
      steeringY -= this.y
      let mag = Math.hypot(steeringX, steeringY)
      if (mag > 0) {
        steeringX = (steeringX / mag) * this.maxSpeed
        steeringY = (steeringY / mag) * this.maxSpeed
      }
      steeringX -= this.vx
      steeringY -= this.vy
      let steerMag = Math.hypot(steeringX, steeringY)
      if (steerMag > this.maxForce) {
        steeringX = (steeringX / steerMag) * this.maxForce
        steeringY = (steeringY / steerMag) * this.maxForce
      }
    }
    // Weaker cohesion (0.6) — prevents tight clustering; birds spread out more
    return { x: steeringX * 0.6, y: steeringY * 0.6 }
  }

  separation(boids: Boid[]) {
    let perceptionRadius = 18
    let steeringX = 0
    let steeringY = 0
    let total = 0
    for (let other of boids) {
      if (other !== this) {
        let d = Math.hypot(this.x - other.x, this.y - other.y)
        if (d < perceptionRadius && d > 0) {
          let diffX = this.x - other.x
          let diffY = this.y - other.y
          diffX /= d * d
          diffY /= d * d
          steeringX += diffX
          steeringY += diffY
          total++
        }
      }
    }
    if (total > 0) {
      steeringX /= total
      steeringY /= total
      let mag = Math.hypot(steeringX, steeringY)
      if (mag > 0) {
        steeringX = (steeringX / mag) * this.maxSpeed
        steeringY = (steeringY / mag) * this.maxSpeed
      }
      steeringX -= this.vx
      steeringY -= this.vy
      let steerMag = Math.hypot(steeringX, steeringY)
      if (steerMag > this.maxForce) {
        steeringX = (steeringX / steerMag) * this.maxForce
        steeringY = (steeringY / steerMag) * this.maxForce
      }
    }
    return { x: steeringX * 1.5, y: steeringY * 1.5 } // stronger separation
  }

  flock(boids: Boid[]) {
    let alignment = this.align(boids)
    let cohesion = this.cohesion(boids)
    let separation = this.separation(boids)
    const flockWeight = 0.12
    this.vx += (alignment.x + cohesion.x + separation.x) * flockWeight
    this.vy += (alignment.y + cohesion.y + separation.y) * flockWeight
  }

  /**
   * When many birds are close together, gently nudge toward a loose V.
   * Kept weak and spread out so birds don't get stuck — they can easily break free.
   */
  formationSteer(boids: Boid[]): { x: number; y: number } | null {
    if (boids.length < 20) return null

    const cx = boids.reduce((s, b) => s + b.x, 0) / boids.length
    const cy = boids.reduce((s, b) => s + b.y, 0) / boids.length
    const avgVx = boids.reduce((s, b) => s + b.vx, 0) / boids.length
    const avgVy = boids.reduce((s, b) => s + b.vy, 0) / boids.length
    const angle = Math.atan2(avgVy, avgVx)

    // Stricter threshold — only form when flock is naturally very dense
    const densityRadius = 70
    const nearCount = boids.filter((b) => Math.hypot(b.x - cx, b.y - cy) < densityRadius).length
    if (nearCount < 25) return null

    // Wider spacing so birds don't cluster — spread the V out
    const scale = 22
    const formationSlots: { x: number; y: number }[] = []
    formationSlots.push({ x: 0, y: 0 })
    for (let i = 1; i <= 8; i++) {
      formationSlots.push({ x: -i * scale * 0.6, y: -i * scale * 0.45 })
      formationSlots.push({ x: i * scale * 0.6, y: -i * scale * 0.45 })
    }

    const slotIdx = this.index % formationSlots.length
    const slot = formationSlots[slotIdx]
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const targetX = cx + slot.x * cosA - slot.y * sinA
    const targetY = cy + slot.x * sinA + slot.y * cosA

    const dx = targetX - this.x
    const dy = targetY - this.y
    const dist = Math.hypot(dx, dy)
    if (dist < 8) return null

    // Much weaker force — gentle nudge, not a lock (maxForce * 0.8)
    const desiredSpeed = Math.min(dist * 0.03, this.maxSpeed * 0.5)
    const steerX = (dx / dist) * desiredSpeed - this.vx
    const steerY = (dy / dist) * desiredSpeed - this.vy
    const steerMag = Math.hypot(steerX, steerY)
    const capped = Math.min(steerMag, this.maxForce * 0.8)
    if (steerMag === 0) return null
    return { x: (steerX / steerMag) * capped, y: (steerY / steerMag) * capped }
  }

  /**
   * Repulsion — birds fly away from the cursor when it gets close.
   */
  interact(
    smoothedMx: number,
    smoothedMy: number,
    influence: number,
    width: number,
    height: number,
    breath: number
  ) {
    if (influence <= 0) return
    const cx = smoothedMx * width
    const cy = smoothedMy * height
    const dx = this.x - cx
    const dy = this.y - cy
    const d = Math.hypot(dx, dy)
    const outerRadius = 280
    const innerRadius = 40
    if (d > outerRadius || d < 4) return

    const dirX = dx / d
    const dirY = dy / d
    
    // Gentle swirling current vector
    const swirlX = dirY
    const swirlY = -dirX

    const eff = influence * breath
    const t = d / outerRadius
    const bell = 1 - t * t
    
    // Organic, soft repel combined with a strong swirling motion
    const pushStrength = 0.05 * eff * (1 - (innerRadius / d)) * bell
    const swirlStrength = 0.14 * eff * bell
    
    this.vx += dirX * pushStrength + swirlX * swirlStrength
    this.vy += dirY * pushStrength + swirlY * swirlStrength
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    let speed = Math.hypot(this.vx, this.vy)
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed
      this.vy = (this.vy / speed) * this.maxSpeed
    }
  }

  /** Random impulse to break up clusters — called periodically */
  scatter() {
    const angle = Math.random() * Math.PI * 2
    const mag = 0.8 + Math.random() * 1.2
    this.vx += Math.cos(angle) * mag
    this.vy += Math.sin(angle) * mag
  }

  draw(ctx: CanvasRenderingContext2D, jumpOffset = 0) {
    ctx.save()
    const drawX = this.isLanded ? this.landX : this.x
    const drawY = this.isLanded ? this.landY + jumpOffset : this.y
    const angle = this.isLanded ? 0 : Math.atan2(this.vy, this.vx)
    ctx.translate(drawX, drawY)
    ctx.rotate(angle)

    // Boid: logo shape rotated so apex points in flight direction (right = +X)
    ctx.beginPath()
    ctx.moveTo(2.5, 0)         // Apex (front, direction of travel)
    ctx.lineTo(-0.8, -1.5)     // Upper shoulder
    ctx.lineTo(-2, -2.3)       // Upper outer spike
    ctx.lineTo(-0.6, -0.8)     // Upper V-notch
    ctx.lineTo(-2.5, 0)        // Center spike (back)
    ctx.lineTo(-0.6, 0.8)      // Lower V-notch
    ctx.lineTo(-2, 2.3)        // Lower outer spike
    ctx.lineTo(-0.8, 1.5)      // Lower shoulder
    ctx.closePath()

    ctx.fillStyle = 'rgba(34, 211, 238, 0.95)'
    ctx.shadowBlur = 6
    ctx.shadowColor = 'rgba(34, 211, 238, 0.6)'
    ctx.fill()

    // Bullseye eye: white ring + black pupil
    ctx.beginPath()
    ctx.arc(0.4, 0, 0.85, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0.4, 0, 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(10, 10, 11, 0.95)'
    ctx.fill()

    ctx.restore()
  }
}

export function BirdsFly({
  mouseX,
  mouseY,
  isHovering,
  scrollY = 0,
  landingTarget = null,
}: {
  mouseX: number
  mouseY: number
  isHovering: boolean
  scrollY?: number
  landingTarget?: DOMRect | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ mouseX, mouseY, isHovering, scrollY, landingTarget })
  propsRef.current = { mouseX, mouseY, isHovering, scrollY, landingTarget }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setSize = () => {
      const w = canvas.offsetWidth || canvas.parentElement?.clientWidth || 300
      const h = canvas.offsetHeight || canvas.parentElement?.clientHeight || 300
      if (w > 0 && h > 0) {
        width = w
        height = h
        canvas.width = w
        canvas.height = h
      }
    }
    let width = 0
    let height = 0
    setSize()

    const handleResize = () => {
      setSize()
    }
    window.addEventListener('resize', handleResize)

    const flock: Boid[] = []
    const initFlock = () => {
      flock.length = 0
      const w = Math.max(1, width)
      const h = Math.max(1, height)
      for (let i = 0; i < 28; i++) {
        flock.push(new Boid(Math.random() * w, Math.random() * h, i))
      }
    }
    initFlock()

    let smoothX = 0.5
    let smoothY = 0.5
    let hoverProgress = 0
    let frame = 0
    const LERP = 0.06
    const HOVER_RAMP = 0.032

    let animationId: number
    const render = () => {
      try {
        frame++
        const w = canvas.offsetWidth || 1
        const h = canvas.offsetHeight || 1
        if (w !== width || h !== height) {
          setSize()
        }
        if (width <= 0 || height <= 0) {
          animationId = requestAnimationFrame(render)
          return
        }

        const { mouseX: mx, mouseY: my, isHovering: hovering, scrollY: sy, landingTarget: target } = propsRef.current
        smoothX += (mx - smoothX) * LERP
        smoothY += (my - smoothY) * LERP
        hoverProgress = Math.max(0, Math.min(1, hoverProgress + (hovering ? HOVER_RAMP : -HOVER_RAMP * 2)))
        const breath = 0.94 + 0.06 * Math.sin(frame * 0.02)

        const landingX = target ? target.left + target.width / 2 : 0
        const landingY = target ? target.top + 24 : 0

        if (target) {
          let landingBoid: Boid | null = null
          let minDist = Infinity
          for (const b of flock) {
            if (b.isLanded) {
              landingBoid = b
              break
            }
            const d = Math.hypot(b.x - landingX, b.y - landingY)
            if (d < minDist) {
              minDist = d
              landingBoid = b
            }
          }
          if (landingBoid) {
            if (landingBoid.isLanded) {
            } else {
              const dx = landingX - landingBoid.x
              const dy = landingY - landingBoid.y
              const d = Math.hypot(dx, dy)
              if (d < 12) {
                landingBoid.isLanded = true
                landingBoid.landX = landingX
                landingBoid.landY = landingY
              } else {
                const steer = 0.14 * Math.min(1, 80 / d)
                landingBoid.vx += (dx / d) * steer
                landingBoid.vy += (dy / d) * steer
              }
            }
          }
        } else {
          for (const b of flock) {
            if (b.isLanded) {
              b.isLanded = false
              b.vx = (Math.random() - 0.5) * 1.5
              b.vy = -2 - Math.random() * 1
            }
          }
        }

        if (frame > 0 && frame % 3600 === 0) {
          for (const boid of flock) {
            if (!boid.isLanded) boid.scatter()
          }
        }

        ctx.clearRect(0, 0, width, height)

        const visibleRatio = Math.max(0.12, 1 - sy / 2200)
        const jumpOffset = Math.sin(frame * 0.18) * 5

        for (let boid of flock) {
          if (boid.isLanded) {
            if (boid.drawSeed < visibleRatio) boid.draw(ctx, jumpOffset)
            continue
          }
          boid.edges(width, height)
          boid.flock(flock)
          boid.interact(smoothX, smoothY, hoverProgress, width, height, breath)
          boid.update()
          if (boid.drawSeed < visibleRatio) boid.draw(ctx)
        }
      } catch (err) {
        console.error('BirdsFly render error:', err)
      }
      animationId = requestAnimationFrame(render)
    }

    render()
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pixels-birds-container"
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  )
}
