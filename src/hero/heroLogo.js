import gsap from 'gsap'
import { HERO_LOGO_FOLLOW, LOGO_TILT } from '../animations.js'
import devclubLogo from '../assets/devclub-logo.png'

export function renderHeroLogo() {
  const container = document.querySelector('#hero-logo')
  const heroSection = document.querySelector('#hero')
  if (!container || !heroSection) return

  container.innerHTML = `
    <div id="logo-perspective" style="perspective: ${LOGO_TILT.perspective}px;">
      <img
        id="logo-inner"
        src="${devclubLogo}"
        alt="Logo DevClub"
        class="w-80 h-80"
        style="will-change: transform; transform-style: preserve-3d;"
      />
    </div>
  `

  const logoInner = container.querySelector('#logo-inner')

  const setX = gsap.quickTo(logoInner, 'x', {
    duration: HERO_LOGO_FOLLOW.duration,
    ease: HERO_LOGO_FOLLOW.ease,
  })
  const setY = gsap.quickTo(logoInner, 'y', {
    duration: HERO_LOGO_FOLLOW.duration,
    ease: HERO_LOGO_FOLLOW.ease,
  })
  const setRotationX = gsap.quickTo(logoInner, 'rotationX', {
    duration: LOGO_TILT.duration,
    ease: LOGO_TILT.ease,
  })
  const setRotationY = gsap.quickTo(logoInner, 'rotationY', {
    duration: LOGO_TILT.duration,
    ease: LOGO_TILT.ease,
  })

  // Posição de origem da logo e limites do Hero — recalculados
  // no carregamento e sempre que a janela for redimensionada.
  let anchorCenterX = 0
  let anchorCenterY = 0
  let heroRect = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 }

  function measure() {
    const anchorRect = container.getBoundingClientRect()
    anchorCenterX = anchorRect.left + anchorRect.width / 2
    anchorCenterY = anchorRect.top + anchorRect.height / 2
    heroRect = heroSection.getBoundingClientRect()
  }
  measure()

  function handleMouseMove(e) {
    const logoHalfW = logoInner.offsetWidth / 2
    const logoHalfH = logoInner.offsetHeight / 2

    // Deslocamento "bruto" — a logo tenta ficar o mais perto possível do cursor
    const rawOffsetX = e.clientX - anchorCenterX
    const rawOffsetY = e.clientY - anchorCenterY

    // Limites: a logo nunca pode sair da área visível do Hero
    const minOffsetX = heroRect.left + logoHalfW - anchorCenterX
    const maxOffsetX = heroRect.right - logoHalfW - anchorCenterX
    const minOffsetY = heroRect.top + logoHalfH - anchorCenterY
    const maxOffsetY = heroRect.bottom - logoHalfH - anchorCenterY

    const offsetX = gsap.utils.clamp(minOffsetX, maxOffsetX, rawOffsetX)
    const offsetY = gsap.utils.clamp(minOffsetY, maxOffsetY, rawOffsetY)

    setX(offsetX)
    setY(offsetY)

    // Inclinação baseada na posição relativa dentro do Hero (-1 a 1)
    const normalizedX = gsap.utils.clamp(-1, 1, rawOffsetX / (heroRect.width / 2))
    const normalizedY = gsap.utils.clamp(-1, 1, rawOffsetY / (heroRect.height / 2))

    setRotationY(normalizedX * LOGO_TILT.maxRotation)
    setRotationX(-normalizedY * LOGO_TILT.maxRotation)
  }

  window.addEventListener('resize', measure)
  document.addEventListener('mousemove', handleMouseMove)

  return function cleanup() {
    document.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', measure)
    gsap.set(logoInner, { rotationX: 0, rotationY: 0 })
  }
}