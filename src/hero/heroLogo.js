import gsap from 'gsap'
import { subscribeMousePosition } from '../utils/mousePosition.js'
import { HERO_LOGO_FOLLOW } from '../animations.js'
import devclubLogo from '../assets/devclub-logo.png'

export function renderHeroLogo() {
  const container = document.querySelector('#hero-logo')
  if (!container) return

  // Não precisamos mais do wrapper de perspective — sem rotação 3D,
  // ele não tem função aqui.
  container.innerHTML = `
    <img
      id="logo-inner"
      src="${devclubLogo}"
      alt="Logo DevClub"
      class="w-50 h-50"
      style="will-change: transform;"
    />
  `

  const logoInner = container.querySelector('#logo-inner')

  // quickTo pra x/y, mesmo princípio de performance que já
  // usávamos pro rotationX/rotationY.
  const setX = gsap.quickTo(logoInner, 'x', {
    duration: HERO_LOGO_FOLLOW.duration,
    ease: HERO_LOGO_FOLLOW.ease,
  })
  const setY = gsap.quickTo(logoInner, 'y', {
    duration: HERO_LOGO_FOLLOW.duration,
    ease: HERO_LOGO_FOLLOW.ease,
  })

  const unsubscribe = subscribeMousePosition(({ normalizedX, normalizedY }) => {
    // Mesma lógica de antes, só que agora move em vez de rotacionar.
    setX(normalizedX * HERO_LOGO_FOLLOW.range)
    setY(normalizedY * HERO_LOGO_FOLLOW.range)
  })

  return function cleanup() {
    unsubscribe()
  }
}