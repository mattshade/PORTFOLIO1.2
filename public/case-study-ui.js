/* Back-to-top for static case study pages — mirrors BackToTop behavior */
;(function () {
  var btn = document.getElementById('cs-back-to-top')
  if (!btn) return
  var isAnimating = false

  var svg = btn.querySelector('svg')
  if (svg && !btn.querySelector('.boid-container')) {
    svg.classList.add('boid-flyer')

    var bodyPath = svg.querySelector('path')
    if (bodyPath) bodyPath.classList.add('boid-body')

    var circles = svg.querySelectorAll('circle')
    if (circles[0]) circles[0].classList.add('eye-white')
    if (circles[1]) circles[1].classList.add('eye-pupil')

    if (!svg.querySelector('.boid-eye') && circles.length) {
      var eyeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      eyeGroup.setAttribute('class', 'boid-eye')
      circles.forEach(function (node) {
        eyeGroup.appendChild(node)
      })
      svg.appendChild(eyeGroup)
    }

    var boidContainer = document.createElement('div')
    boidContainer.className = 'boid-container'
    boidContainer.appendChild(svg)

    var trails = document.createElement('div')
    trails.className = 'boid-trails'
    trails.setAttribute('aria-hidden', 'true')
    trails.innerHTML = '<div class="trail-line"></div><div class="trail-line"></div><div class="trail-line"></div>'
    boidContainer.appendChild(trails)

    btn.appendChild(boidContainer)
  }

  function tick() {
    var y = window.scrollY || document.documentElement.scrollTop
    btn.classList.toggle('visible', y > 400)
  }
  window.addEventListener('scroll', tick, { passive: true })
  tick()
  btn.addEventListener('click', function () {
    if (isAnimating) return
    isAnimating = true
    btn.classList.add('is-blinking')

    setTimeout(function () {
      btn.classList.remove('is-blinking')
      btn.classList.add('is-flying')
      window.scrollTo({ top: 0, behavior: 'smooth' })

      setTimeout(function () {
        btn.classList.remove('is-flying')
        isAnimating = false
      }, 1200)
    }, 250)
  })

  // Mobile Hamburger Menu Logic
  var hamburger = document.querySelector('.cs-hamburger');
  var navLinks = document.querySelector('.cs-nav-links');
  var nav = document.querySelector('.cs-nav');
  var isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      hamburger.classList.add('active');
      navLinks.classList.add('open');
      nav.classList.add('nav-open');
      document.body.style.overflow = 'hidden';
    } else {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      nav.classList.remove('nav-open');
      document.body.style.overflow = '';
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  // Close menu when a link is clicked
  var links = document.querySelectorAll('.cs-nav-link');
  links.forEach(function(link) {
    link.addEventListener('click', function() {
      if (isMenuOpen) toggleMenu();
    });
  });

})()
