import gsap from 'gsap'
import { HERO_TECH_STACK } from '../animations.js'

import html5 from '../assets/tech/html5.svg'
import javascript from '../assets/tech/javascript.svg'
import react from '../assets/tech/react.svg'
import postgresql from '../assets/tech/postgresql.svg'
import mongodb from '../assets/tech/mongodb.svg'
import nodejs from '../assets/tech/nodejs.svg'
import css3 from '../assets/tech/css3.svg'
import github from '../assets/tech/github.svg'

const TECH_LOGOS = [html5, javascript, react, postgresql, mongodb, nodejs, css3, github]

export function renderHeroTechStack() {
  const anchor = document.querySelector('#tech-stack-anchor')
  const hero = document.querySelector('#hero')
  const logoEl = document.querySelector('#logo-inner')
  if (!anchor || !hero || !logoEl) return

  anchor.innerHTML = TECH_LOGOS.map((src, i) => `
    <img
      src="${src}"
      class="tech-logo"
      style="position: absolute; top: 50%; left: 50%; width: 40px; height: 40px; opacity: 0; transform: translate(-50%, -50%); will-change: transform;"
      data-index="${i}"
    />
  `).join('')

  const icons = Array.from(anchor.querySelectorAll('.tech-logo'))
  const angleStep = (Math.PI * 2) / icons.length

  let angle = 0
  const center = { x: 0, y: 0 }

  const tick = (time, deltaMs) => {
    const targetX = gsap.getProperty(logoEl, 'x')
    const targetY = gsap.getProperty(logoEl, 'y')
    center.x += (targetX - center.x) * HERO_TECH_STACK.followLag
    center.y += (targetY - center.y) * HERO_TECH_STACK.followLag

    angle += HERO_TECH_STACK.rotationSpeed * (deltaMs / 1000)

    icons.forEach((icon, i) => {
      const itemAngle = angle + angleStep * i
      const radius = HERO_TECH_STACK.baseRadius + i * HERO_TECH_STACK.radiusStep

      const x = center.x + Math.cos(itemAngle) * radius
      const y = center.y + Math.sin(itemAngle) * radius

      gsap.set(icon, { x, y })
    })
  }

  gsap.ticker.add(tick)

  const showIcons = () =>
    gsap.to(icons, { opacity: 1, duration: HERO_TECH_STACK.fadeDuration, stagger: 0.05 })

  const hideIcons = () =>
    gsap.to(icons, { opacity: 0, duration: HERO_TECH_STACK.fadeDuration })

  hero.addEventListener('mouseenter', showIcons)
  hero.addEventListener('mouseleave', hideIcons)

  return function cleanup() {
    gsap.ticker.remove(tick)
    hero.removeEventListener('mouseenter', showIcons)
    hero.removeEventListener('mouseleave', hideIcons)
  }
}