import gsap from 'gsap'
import { SHOOTING_STARS } from '../animations.js'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function spawnStar(container) {
  const star = document.createElement('div')

  // Nasce em qualquer lugar da largura da tela, na metade superior —
  // meteoros "caindo" de cima parecem mais naturais que de baixo.
  const startX = randomBetween(0, window.innerWidth)
  const startY = randomBetween(-50, window.innerHeight * 0.4)
  const angle = randomBetween(20, 45) // graus, diagonal descendente
  const distance = randomBetween(300, 600)
  const duration = randomBetween(SHOOTING_STARS.minDuration, SHOOTING_STARS.maxDuration)

  const radians = (angle * Math.PI) / 180
  const deltaX = Math.cos(radians) * distance
  const deltaY = Math.sin(radians) * distance

  star.style.cssText = `
    position: absolute;
    top: ${startY}px;
    left: ${startX}px;
    width: ${SHOOTING_STARS.trailLength}px;
    height: 2px;
    background: linear-gradient(90deg, ${SHOOTING_STARS.color}, transparent);
    border-radius: 999px;
    transform: rotate(${angle}deg);
    opacity: 0;
    will-change: transform, opacity;
  `

  container.appendChild(star)

  // Timeline: some rápido (fade in), atravessa a tela, e desaparece
  // (fade out) perto do fim do trajeto — não é só um movimento linear.
  const tl = gsap.timeline({ onComplete: () => star.remove() })

  tl.to(star, { opacity: 1, duration: duration * 0.15 }, 0)
    .to(star, { x: deltaX, y: deltaY, duration, ease: 'power1.in' }, 0)
    .to(star, { opacity: 0, duration: duration * 0.3 }, duration * 0.7)
}

export function initShootingStars() {
  const container = document.querySelector('#shooting-stars')
  if (!container) return

  let timeoutId

  function loop() {
    const count = Math.round(randomBetween(SHOOTING_STARS.minPerWave, SHOOTING_STARS.maxPerWave))

    for (let i = 0; i < count; i++) {
      const microDelay = randomBetween(0, 200)
      setTimeout(() => spawnStar(container), microDelay)
    }

    const nextDelay = randomBetween(SHOOTING_STARS.minInterval, SHOOTING_STARS.maxInterval)
    timeoutId = setTimeout(loop, nextDelay)
  }

  loop() // ← ESSA LINHA FALTAVA — sem ela, loop() nunca é executado

  return function cleanup() {
    clearTimeout(timeoutId)
  }
}