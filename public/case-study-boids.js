/**
 * Case-study flock — logo silhouette matches BirdsFly; tuned for static pages:
 * - Few boids; most of the time they perch on the nav bar and section dividers
 * - Soft repulsion from [data-cs-boids-avoid] (main column)
 * - Periodic takeoff / re-land (not endless zooming)
 */
;(function () {
  var canvas = document.getElementById('cs-boids-canvas')
  if (!canvas) return

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.parentElement.style.display = 'none'
    return
  }

  var ctx = canvas.getContext('2d')
  if (!ctx) return

  var CASE_PALETTE = ['#93C572', '#7dae5c', '#adebb3', '#5eead4', '#14b8a6', '#6b9080']

  function Boid(x, y, index) {
    this.x = x
    this.y = y
    this.vx = (Math.random() * 2 - 1) * 1.8
    this.vy = (Math.random() * 2 - 1) * 1.8
    this.maxSpeed = 2.1
    this.maxForce = 0.085
    this.index = index
    this.drawSeed = Math.random()
    this.color = CASE_PALETTE[Math.floor(Math.random() * CASE_PALETTE.length)]
    this.isLanded = false
    this.landX = 0
    this.landY = 0
    this.hopTimer = 0
    this.wirePreference = Math.random()
    this.landTargetT = Math.random()
    this.landPadL = 0.06 + Math.random() * 0.08
    this.landPadR = 0.06 + Math.random() * 0.08
    this.landedWireIndex = 0
  }

  Boid.prototype.rerollLandingTargets = function () {
    this.wirePreference = Math.random()
    this.landTargetT = Math.random()
    this.landPadL = 0.06 + Math.random() * 0.08
    this.landPadR = 0.06 + Math.random() * 0.08
  }

  Boid.prototype.scatter = function () {
    var angle = Math.random() * Math.PI * 2
    var mag = 0.5 + Math.random() * 0.6
    this.vx += Math.cos(angle) * mag
    this.vy += Math.sin(angle) * mag
  }

  Boid.prototype.edges = function (width, height) {
    if (this.isLanded) return
    if (this.x > width + 20) this.x = -20
    if (this.x < -20) this.x = width + 20
    if (this.y > height + 20) this.y = -20
    if (this.y < -20) this.y = height + 20
  }

  Boid.prototype.align = function (boids) {
    var perceptionRadius = 28
    var steeringX = 0
    var steeringY = 0
    var total = 0
    for (var i = 0; i < boids.length; i++) {
      var other = boids[i]
      if (other === this || other.isLanded) continue
      var d = Math.hypot(this.x - other.x, this.y - other.y)
      if (d < perceptionRadius) {
        steeringX += other.vx
        steeringY += other.vy
        total++
      }
    }
    if (total > 0) {
      steeringX /= total
      steeringY /= total
      var mag = Math.hypot(steeringX, steeringY)
      if (mag > 0) {
        steeringX = (steeringX / mag) * this.maxSpeed
        steeringY = (steeringY / mag) * this.maxSpeed
      }
      steeringX -= this.vx
      steeringY -= this.vy
      var steerMag = Math.hypot(steeringX, steeringY)
      if (steerMag > this.maxForce) {
        steeringX = (steeringX / steerMag) * this.maxForce
        steeringY = (steeringY / steerMag) * this.maxForce
      }
    }
    return { x: steeringX, y: steeringY }
  }

  Boid.prototype.cohesion = function (boids) {
    var perceptionRadius = 28
    var steeringX = 0
    var steeringY = 0
    var total = 0
    for (var i = 0; i < boids.length; i++) {
      var other = boids[i]
      if (other === this || other.isLanded) continue
      var d = Math.hypot(this.x - other.x, this.y - other.y)
      if (d < perceptionRadius) {
        steeringX += other.x
        steeringY += other.y
        total++
      }
    }
    if (total > 0) {
      steeringX /= total
      steeringY /= total
      steeringX -= this.x
      steeringY -= this.y
      var mag = Math.hypot(steeringX, steeringY)
      if (mag > 0) {
        steeringX = (steeringX / mag) * this.maxSpeed
        steeringY = (steeringY / mag) * this.maxSpeed
      }
      steeringX -= this.vx
      steeringY -= this.vy
      var steerMag = Math.hypot(steeringX, steeringY)
      if (steerMag > this.maxForce) {
        steeringX = (steeringX / steerMag) * this.maxForce
        steeringY = (steeringY / steerMag) * this.maxForce
      }
    }
    return { x: steeringX * 0.5, y: steeringY * 0.5 }
  }

  Boid.prototype.separation = function (boids) {
    var perceptionRadius = 18
    var steeringX = 0
    var steeringY = 0
    var total = 0
    for (var i = 0; i < boids.length; i++) {
      var other = boids[i]
      if (other === this || other.isLanded) continue
      var d = Math.hypot(this.x - other.x, this.y - other.y)
      if (d < perceptionRadius && d > 0) {
        steeringX += (this.x - other.x) / (d * d)
        steeringY += (this.y - other.y) / (d * d)
        total++
      }
    }
    if (total > 0) {
      steeringX /= total
      steeringY /= total
      var mag = Math.hypot(steeringX, steeringY)
      if (mag > 0) {
        steeringX = (steeringX / mag) * this.maxSpeed
        steeringY = (steeringY / mag) * this.maxSpeed
      }
      steeringX -= this.vx
      steeringY -= this.vy
      var steerMag = Math.hypot(steeringX, steeringY)
      if (steerMag > this.maxForce) {
        steeringX = (steeringX / steerMag) * this.maxForce
        steeringY = (steeringY / steerMag) * this.maxForce
      }
    }
    return { x: steeringX * 1.2, y: steeringY * 1.2 }
  }

  Boid.prototype.flock = function (boids) {
    if (this.isLanded) return
    var alignment = this.align(boids)
    var cohesion = this.cohesion(boids)
    var separation = this.separation(boids)
    var w = 0.07
    this.vx += (alignment.x + cohesion.x + separation.x) * w
    this.vy += (alignment.y + cohesion.y + separation.y) * w
  }

  Boid.prototype.update = function () {
    if (this.isLanded) return
    this.vx += (Math.random() - 0.5) * 0.018
    this.vy += (Math.random() - 0.5) * 0.018
    this.x += this.vx
    this.y += this.vy
    this.vx *= 0.992
    this.vy *= 0.992
    var speed = Math.hypot(this.vx, this.vy)
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed
      this.vy = (this.vy / speed) * this.maxSpeed
    }
  }

  Boid.prototype.draw = function (c) {
    c.save()
    var jumpOffset = 0
    if (this.hopTimer > 0) {
      var p = 1 - this.hopTimer / 30
      jumpOffset = -Math.sin(p * Math.PI) * 10
      this.hopTimer--
    }
    var drawX = this.isLanded ? this.landX : this.x
    var drawY = this.isLanded ? this.landY + jumpOffset : this.y
    var angle = this.isLanded ? 0 : Math.atan2(this.vy, this.vx)
    c.translate(drawX, drawY)
    c.rotate(angle)
    c.beginPath()
    c.moveTo(2.5, 0)
    c.lineTo(-0.8, -1.5)
    c.lineTo(-2, -2.3)
    c.lineTo(-0.6, -0.8)
    c.lineTo(-2.5, 0)
    c.lineTo(-0.6, 0.8)
    c.lineTo(-2, 2.3)
    c.lineTo(-0.8, 1.5)
    c.closePath()
    c.fillStyle = this.color
    c.shadowBlur = 2
    c.shadowColor = 'rgba(0, 0, 0, 0.08)'
    c.fill()
    c.beginPath()
    c.arc(0.4, 0, 0.85, 0, Math.PI * 2)
    c.fillStyle = 'rgba(255, 255, 255, 0.95)'
    c.fill()
    c.beginPath()
    c.arc(0.4, 0, 0.35, 0, Math.PI * 2)
    c.fillStyle = 'rgba(10, 10, 11, 0.95)'
    c.fill()
    c.restore()
  }

  function getAvoidRect() {
    var el = document.querySelector('[data-cs-boids-avoid]')
    if (!el) return null
    return el.getBoundingClientRect()
  }

  function applyContentRepulsion(boid, rect) {
    if (!rect || rect.width < 10 || boid.isLanded) return
    var margin = 40
    var L = rect.left - margin
    var R = rect.right + margin
    var T = rect.top - margin
    var B = rect.bottom + margin
    var cx = (rect.left + rect.right) / 2
    var cy = (rect.top + rect.bottom) / 2
    if (boid.x >= L && boid.x <= R && boid.y >= T && boid.y <= B) {
      var dx = boid.x - cx
      var dy = boid.y - cy
      var d = Math.hypot(dx, dy) || 1
      boid.vx += (dx / d) * 0.14
      boid.vy += (dy / d) * 0.14
    }
  }

  function buildWires(height) {
    var els = document.querySelectorAll('.cs-nav, .cs-bird-wire')
    var out = []
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      var rect = el.getBoundingClientRect()
      if (rect.bottom < -80 || rect.top > height + 80) continue
      var isNav = el.classList.contains('cs-nav')
      var landTop = isNav ? rect.bottom : rect.top
      out.push({
        top: landTop,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        isNav: isNav,
      })
    }
    return out
  }

  var width = 300
  var height = 300
  var flock = []
  var idleFrames = 0

  function setSize() {
    var w = window.innerWidth
    var h = window.innerHeight
    if (w > 0 && h > 0) {
      width = w
      height = h
      canvas.width = width
      canvas.height = height
    }
  }

  function initFlock() {
    flock.length = 0
    var n = width < 520 ? 5 : 7
    for (var i = 0; i < n; i++) {
      flock.push(new Boid(Math.random() * width, Math.random() * height * 0.35, i))
    }
  }

  setSize()
  initFlock()

  window.addEventListener('resize', function () {
    setSize()
    initFlock()
  })

  window.addEventListener(
    'scroll',
    function () {
      lastScrollY = window.scrollY
    },
    { passive: true }
  )

  var frame = 0
  var prevScroll = 0

  function loop() {
    frame++
    try {
      if (width <= 0 || height <= 0) {
        requestAnimationFrame(loop)
        return
      }

      var rect = getAvoidRect()
      var wires = buildWires(height)
      var scrollDelta = Math.abs(window.scrollY - prevScroll)
      prevScroll = window.scrollY

      if (scrollDelta > 2) {
        idleFrames = 0
        for (var t = 0; t < flock.length; t++) {
          var bt = flock[t]
          if (bt.isLanded && Math.random() < 0.12) {
            bt.isLanded = false
            bt.rerollLandingTargets()
            bt.vy = -1.2 - Math.random() * 1.2
            bt.vx = (Math.random() - 0.5) * 2
          }
        }
      } else {
        idleFrames++
      }

      for (var i = 0; i < flock.length; i++) {
        var b = flock[i]
        if (b.isLanded) {
          if (wires.length > 0) {
            var sync = wires[Math.min(b.landedWireIndex, wires.length - 1)]
            if (sync) {
              var span = Math.max(0.12, 1 - b.landPadL - b.landPadR)
              b.landX = sync.left + (b.landPadL + b.landTargetT * span) * sync.width
              b.landY = sync.top - 2
            }
          }
          if (idleFrames > 420 && Math.random() < 0.002 && b.hopTimer === 0) {
            b.hopTimer = 28
          }
          if (idleFrames > 600 && Math.random() < 0.0012) {
            b.isLanded = false
            b.rerollLandingTargets()
            b.vy = -1 - Math.random()
            b.vx = (Math.random() - 0.5) * 1.5
          }
          continue
        }

        if (wires.length > 0) {
          var nW = wires.length
          var wi = Math.min(nW - 1, Math.floor(b.wirePreference * nW))
          var wire = wires[wi]
          var span2 = Math.max(0.12, 1 - b.landPadL - b.landPadR)
          var landingX = wire.left + (b.landPadL + b.landTargetT * span2) * wire.width
          var landingY = wire.top - 2
          var dx = landingX - b.x
          var dy = landingY - b.y
          var d = Math.hypot(dx, dy)
          if (d < 2.5) {
            b.isLanded = true
            b.landedWireIndex = wi
            b.landX = landingX
            b.landY = landingY
            b.vx = 0
            b.vy = 0
            continue
          }
          var steer = 0.32 * Math.min(1, 140 / d)
          b.vx += (dx / d) * steer
          b.vy += (dy / d) * steer
          if (d < 12) {
            var damp = 0.82 + (d / 12) * 0.15
            b.vx *= damp
            b.vy *= damp
          }
        }

        applyContentRepulsion(b, rect)
        b.flock(flock)
        b.edges(width, height)
        b.update()
      }

      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = 0.9
      for (var k = 0; k < flock.length; k++) {
        if (flock[k].drawSeed < 0.99) flock[k].draw(ctx)
      }
      ctx.globalAlpha = 1
    } catch (e) {
      console.error('case-study-boids:', e)
    }
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
})()
