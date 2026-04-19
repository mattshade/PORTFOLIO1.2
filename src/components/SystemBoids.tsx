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
  color: string
  accentColor: string
  isLanded: boolean
  isLandedOnNav: boolean
  landedElement: Element | null
  targetElement: Element | null
  landX: number
  landY: number
  hopTimer: number
  wirePreference: number
  landTargetT: number
  landPadL: number
  landPadR: number

  constructor(x: number, y: number, index: number) {
    this.x = x
    this.y = y
    this.drawSeed = Math.random()
    // Technical palette: Yellow Green (Lime) and Amber accents
    const isAmber = Math.random() > 0.85
    this.color = isAmber ? 'rgba(226, 179, 90, 0.4)' : 'rgba(190, 242, 100, 0.4)'
    this.accentColor = isAmber ? '#e2b35a' : '#bef264'
    
    this.isLanded = false
    this.isLandedOnNav = false
    this.landedElement = null
    this.targetElement = null
    this.landX = 0
    this.landY = 0
    this.hopTimer = 0
    this.wirePreference = Math.random()
    this.landTargetT = Math.random()
    this.landPadL = 0.04 + Math.random() * 0.07
    this.landPadR = 0.04 + Math.random() * 0.07
    this.vx = (Math.random() * 2 - 1) * 3
    this.vy = (Math.random() * 2 - 1) * 3
    this.maxSpeed = 3.2
    this.maxForce = 0.1
    this.index = index
  }

  edges(width: number, height: number) {
    if (this.x > width + 40) this.x = -40
    if (this.x < -40) this.x = width + 40
    if (this.y > height + 40) this.y = -40
    if (this.y < -40) this.y = height + 40
  }

  align(boids: Boid[]) {
    let perceptionRadius = 35
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
    let perceptionRadius = 35
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
    return { x: steeringX * 0.5, y: steeringY * 0.5 }
  }

  separation(boids: Boid[]) {
    let perceptionRadius = 24
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
    return { x: steeringX * 1.8, y: steeringY * 1.8 }
  }

  flock(boids: Boid[]) {
    let alignment = this.align(boids)
    let cohesion = this.cohesion(boids)
    let separation = this.separation(boids)
    const flockWeight = 0.2
    this.vx += (alignment.x + cohesion.x + separation.x) * flockWeight
    this.vy += (alignment.y + cohesion.y + separation.y) * flockWeight
  }

  formationSteer(boids: Boid[]): { x: number; y: number } | null {
    if (boids.length < 15) return null
    const cx = boids.reduce((s, b) => s + b.x, 0) / boids.length
    const cy = boids.reduce((s, b) => s + b.y, 0) / boids.length
    const avgVx = boids.reduce((s, b) => s + b.vx, 0) / boids.length
    const avgVy = boids.reduce((s, b) => s + b.vy, 0) / boids.length
    const angle = Math.atan2(avgVy, avgVx)

    const densityRadius = 80
    const nearCount = boids.filter((b) => Math.hypot(b.x - cx, b.y - cy) < densityRadius).length
    if (nearCount < 20) return null

    const scale = 25
    const formationSlots: { x: number; y: number }[] = []
    formationSlots.push({ x: 0, y: 0 })
    for (let i = 1; i <= 6; i++) {
        formationSlots.push({ x: -i * scale * 0.7, y: -i * scale * 0.5 })
        formationSlots.push({ x: -i * scale * 0.7, y: i * scale * 0.5 })
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
    if (dist < 10) return null

    const desiredSpeed = Math.min(dist * 0.04, this.maxSpeed * 0.6)
    const steerX = (dx / dist) * desiredSpeed - this.vx
    const steerY = (dy / dist) * desiredSpeed - this.vy
    const steerMag = Math.hypot(steerX, steerY)
    const capped = Math.min(steerMag, this.maxForce * 0.5)
    if (steerMag === 0) return null
    return { x: (steerX / steerMag) * capped, y: (steerY / steerMag) * capped }
  }


  update() {
    this.vx += (Math.random() - 0.5) * 0.05
    this.vy += (Math.random() - 0.5) * 0.05
    this.x += this.vx
    this.y += this.vy
    this.vx *= 0.99
    this.vy *= 0.99
    
    let speed = Math.hypot(this.vx, this.vy)
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed
      this.vy = (this.vy / speed) * this.maxSpeed
    }
  }

  scatter() {
    const angle = Math.random() * Math.PI * 2
    const mag = 1.2 + Math.random() * 1.5
    this.vx += Math.cos(angle) * mag
    this.vy += Math.sin(angle) * mag
    this.wirePreference = Math.random()
    this.landTargetT = Math.random()
  }

  rerollLandingTargets() {
    this.wirePreference = Math.random()
    this.landTargetT = Math.random()
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    let jumpOffset = 0
    if (this.hopTimer > 0) {
      const p = 1 - (this.hopTimer / 30)
      jumpOffset = -Math.sin(p * Math.PI) * 10
      this.hopTimer--
    }

    const drawX = this.isLanded ? this.landX : this.x
    const drawY = this.isLanded ? this.landY + jumpOffset : this.y
    const angle = this.isLanded ? 0 : Math.atan2(this.vy, this.vx)
    ctx.translate(drawX, drawY)
    ctx.rotate(angle)

    // Architectural Low-Poly Bird
    const scale = 3.5
    const points = [
      { x: scale * 1.2, y: 0 },         // 0: Apex (Front)
      { x: -scale * 0.6, y: -scale * 0.8 }, // 1: Upper Wing Tip
      { x: -scale * 0.3, y: -scale * 0.3 }, // 2: Upper Notch
      { x: -scale * 1, y: 0 },         // 3: Tail
      { x: -scale * 0.3, y: scale * 0.3 },  // 4: Lower Notch
      { x: -scale * 0.6, y: scale * 0.8 }  // 5: Lower Wing Tip
    ]

    // Draw Wireframe Lines
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[1].x, points[1].y)
    ctx.lineTo(points[2].x, points[2].y)
    ctx.lineTo(points[3].x, points[3].y)
    ctx.lineTo(points[4].x, points[4].y)
    ctx.lineTo(points[5].x, points[5].y)
    ctx.closePath()

    // Internal blueprint lines
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[2].x, points[2].y)
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[4].x, points[4].y)
    ctx.moveTo(points[2].x, points[2].y)
    ctx.lineTo(points[4].x, points[4].y)

    ctx.strokeStyle = this.accentColor
    ctx.lineWidth = 0.65
    ctx.lineJoin = 'round'
    ctx.stroke()

    // Shaded facets (subtle)
    ctx.fillStyle = this.color
    ctx.fill()

    // Glowing Nodes at Vertices
    points.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 0.85, 0, Math.PI * 2)
      ctx.fillStyle = this.accentColor
      ctx.shadowBlur = 4
      ctx.shadowColor = this.accentColor
      ctx.fill()
    })

    ctx.restore()
  }
}

export function SystemBoids({
  scrollY = 0,
}: {
  scrollY?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ scrollY })
  propsRef.current = { scrollY }


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.offsetWidth || 300
    let height = canvas.offsetHeight || 300
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
    
    const hoverStates = new WeakMap<Element, boolean>()

    let frame = 0
    let lastGlobalScroll = window.scrollY
    let lastScrollTime = Date.now()

    let animationId: number
    const render = () => {
      try {
        frame++
        if (width <= 0 || height <= 0) {
          animationId = requestAnimationFrame(render)
          return
        }

        const currentScroll = window.scrollY
        const now = Date.now()
        if (Math.abs(currentScroll - lastGlobalScroll) > 1) {
          lastScrollTime = now
        }
        
        const sy = currentScroll
        
        const idleTime = now - lastScrollTime

        const wires = Array.from(document.querySelectorAll('.bird-wire, .bird-perch, .bird-perch-card, .nav'))
        const activeWires = wires
          .map((w) => {
            const rect = w.getBoundingClientRect()
            const isNav = w.classList.contains('nav')
            const isPerch = w.classList.contains('bird-perch')
            const isCard = w.classList.contains('bird-perch-card')
            const isNavPerch = isPerch && !!w.closest('.nav')
            const landTop = isNav ? rect.bottom : rect.top
            
            const isHovered = w.matches(':hover')
            const wasHovered = hoverStates.get(w) || false
            const justHovered = isHovered && !wasHovered
            hoverStates.set(w, isHovered)

            return {
              top: landTop,
              bottom: rect.bottom,
              left: rect.left,
              width: rect.width,
              isNav, isPerch, isCard, isNavPerch,
              justHovered
            }
          })
          .filter((r) => r.top > -50 && r.bottom < height + 50)

        // React to scrolling — organic staggered flight
        if (Math.abs(currentScroll - lastGlobalScroll) > 1) {
          for (const boid of flock) {
            if (boid.isLanded && Math.random() < 0.08) {
              boid.isLanded = false
              boid.isLandedOnNav = false
              boid.landedElement = null
              boid.targetElement = null
              boid.rerollLandingTargets()
              boid.vy = -1.5 - Math.random() * 1.5
              boid.vx = (Math.random() - 0.5) * 2
            }
          }
        }

        if (activeWires.length > 0) {
          for (const b of flock) {
            if (b.isLanded) {
              const nearest = activeWires.reduce((prev, curr) => 
                Math.abs(curr.top - b.y) < Math.abs(prev.top - b.y) ? curr : prev
              )
              
              const isPerchType = nearest.isCard || nearest.isPerch || nearest.isNav
              
              if (isPerchType && nearest.justHovered) {
                b.isLanded = false
                b.isLandedOnNav = false
                b.landedElement = null
                b.targetElement = null
                b.rerollLandingTargets()
                b.vx = (Math.random() - 0.5) * 4
                b.vy = -3 - Math.random() * 2
                continue
              }
              
              const nearestEl = wires[activeWires.indexOf(nearest)]
              b.isLandedOnNav = nearest.isNav
              b.landedElement = nearestEl

              const yOffsetNearest = nearest.isPerch ? (nearest.bottom - nearest.top) * 0.35 : -2
              b.landY = nearest.top + yOffsetNearest
              
              if (idleTime > 5000 && Math.random() < 0.0015 && b.hopTimer === 0) {
                b.hopTimer = 30
              }
            } else {
              const canLandOnNavPerch = b.index < 3
              const boidsWires = activeWires.filter(w => {
                if (w.isNavPerch && !canLandOnNavPerch) return false
                return true
              })
              
              if (boidsWires.length === 0) continue
              
              const nWires = boidsWires.length
              const wireIndex = Math.min(
                nWires - 1,
                Math.floor(b.wirePreference * nWires)
              )
              const wire = boidsWires[wireIndex]
              const wireEl = wires[activeWires.indexOf(wire)]

              b.targetElement = wireEl

              const span = Math.max(0.12, 1 - b.landPadL - b.landPadR)
              const landingX = wire.left + (b.landPadL + b.landTargetT * span) * wire.width
              const yOffset = wire.isPerch ? (wire.bottom - wire.top) * 0.35 : -2
              const landingY = wire.top + yOffset
              
              const dx = landingX - b.x
              const dy = landingY - b.y
              const d = Math.hypot(dx, dy)
              
              if (d < 1) {
                b.isLanded = true
                b.isLandedOnNav = wire.isNav
                b.landedElement = wireEl
                b.landX = landingX
                b.landY = landingY
                b.vx = 0
                b.vy = 0
              } else {
                const steer = 0.35 * Math.min(1, 150 / d)
                b.vx += (dx / d) * steer
                b.vy += (dy / d) * steer
                
                if (d < 10) {
                  const dampen = 0.8 + (d / 10) * 0.18
                  b.vx *= dampen
                  b.vy *= dampen
                }
              }
            }
          }
        }

        if (frame > 0 && frame % 900 === 0) {
          for (const boid of flock) {
            if (!boid.isLanded) boid.scatter()
          }
        }

        ctx.clearRect(0, 0, width, height)

        const visibleRatio = Math.max(0.12, 1 - sy / 2200)

        for (let boid of flock) {
          if (boid.isLanded) {
            if (boid.drawSeed < visibleRatio) boid.draw(ctx)
            continue
          }
          boid.edges(width, height)
          boid.flock(flock)
          boid.update()
          if (boid.drawSeed < visibleRatio) boid.draw(ctx)
        }
      } catch (err) {
        console.error('BirdsFly render error:', err)
      }
      lastGlobalScroll = window.scrollY
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
