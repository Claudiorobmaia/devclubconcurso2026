import gsap from 'gsap'
import { subscribeMousePosition } from '../utils/mousePosition.js'
import { MOUSE_GLOW } from '../animations.js'

export function renderMouseGlow() {
  const container = document.querySelector('#mouse-glow')
  if (!container) return

  // 1. Injeta o HTML do círculo de luz.
  // pointer-events-none é ESSENCIAL: sem isso, esse div gigante
  // fica "por cima" de botões/links e bloqueia cliques do usuário.
  container.innerHTML = `
    <div
      id="mouse-glow-orb"
      class="pointer-events-none absolute top-0 left-0 rounded-full opacity-0"
      style="
        width: ${MOUSE_GLOW.size}px;
        height: ${MOUSE_GLOW.size}px;
        background: radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(99,102,241,0.12) 40%, transparent 70%);
        filter: blur(60px);
        will-change: transform;
      "
    ></div>
  `

  const orb = container.querySelector('#mouse-glow-orb')

  // 2. Referência ao container do Hero, pra calcular posição relativa.
  const heroSection = document.querySelector('#hero')
  if (!heroSection) return

  // 3. Cache do rect — só recalcula no resize, NUNCA a cada movimento
  // do mouse (chamar getBoundingClientRect toda hora força reflow
  // e destrói a performance).
  let heroRect = heroSection.getBoundingClientRect()
  function updateHeroRect() {
    heroRect = heroSection.getBoundingClientRect()
  }
  window.addEventListener('resize', updateHeroRect)

  // 4. quickTo: função otimizada do GSAP pra animações repetidas
  // no mesmo elemento (ideal pra "seguir o cursor").
  const setX = gsap.quickTo(orb, 'x', {
    duration: MOUSE_GLOW.duration,
    ease: MOUSE_GLOW.ease,
  })
  const setY = gsap.quickTo(orb, 'y', {
    duration: MOUSE_GLOW.duration,
    ease: MOUSE_GLOW.ease,
  })

  const half = MOUSE_GLOW.size / 2
  let hasEntered = false

  const unsubscribe = subscribeMousePosition(({ x, y }) => {
    // Converte coordenada de TELA -> coordenada relativa ao Hero.
    const relativeX = x - heroRect.left
    const relativeY = y - heroRect.top

    // Subtrai metade do tamanho pra centralizar o círculo no cursor.
    setX(relativeX - half)
    setY(relativeY - half)

    // Fade-in suave só no primeiro movimento do mouse, pra não
    // "nascer" estático no canto (0,0) antes do usuário mexer o mouse.
    if (!hasEntered) {
      hasEntered = true
      gsap.to(orb, { opacity: 1, duration: MOUSE_GLOW.fadeInDuration })
    }
  })

  return function cleanup() {
    unsubscribe()
    window.removeEventListener('resize', updateHeroRect)
  }
}