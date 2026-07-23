import gsap from 'gsap'

export function initDockNavbar(selector, options = {}) {
  const container = document.querySelector(selector)
  if (!container) {
    console.warn(`initDockNavbar: container "${selector}" não encontrado`)
    return
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const {
    maxScale = 1.3,
    minScale = 1,
    influence = 90,
    lift = 6,
  } = options

  const items = Array.from(container.querySelectorAll('.dock-item'))
  if (items.length === 0) return

  const setters = items.map(item => ({
    scale: gsap.quickTo(item, 'scale', { duration: 0.35, ease: 'power2.out' }),
    y: gsap.quickTo(item, 'y', { duration: 0.35, ease: 'power2.out' }),
  }))

  let rafId = null
  let lastMouseX = 0

  function update() {
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect()
      const itemCenter = rect.left + rect.width / 2
      const distance = Math.abs(lastMouseX - itemCenter)

      let scale = minScale
      let y = 0

      if (distance < influence) {
        const t = 1 - distance / influence
        // curva suave (smoothstep) em vez de linear — cresce/desce sem "quebrar"
        const proportion = t * t * (3 - 2 * t)
        scale = minScale + (maxScale - minScale) * proportion
        y = -lift * proportion
      }

      setters[i].scale(scale)
      setters[i].y(y)
    })
    rafId = null
  }

  function handleMove(e) {
    lastMouseX = e.clientX
    if (rafId === null) {
      rafId = requestAnimationFrame(update)
    }
  }

  function handleLeave() {
    items.forEach((item, i) => {
      setters[i].scale(minScale)
      setters[i].y(0)
    })
  }

  container.addEventListener('mousemove', handleMove)
  container.addEventListener('mouseleave', handleLeave)
}