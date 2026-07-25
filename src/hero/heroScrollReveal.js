import { gsap, ScrollTrigger } from '../gsapSetup.js'

export function initHeroScrollReveal() {
  const logo = document.querySelector('#hero-logo')
  const techStack = document.querySelector('#hero-tech-stack')
  if (!logo || !techStack) return

  gsap.set(logo, { opacity: 0, scale: 0.15, y: 400 })
  gsap.set(techStack, { opacity: 0 })

  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=150%',
      scrub: 1,
      pin: true,
    }
  })
  .to(logo, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power2.out' })
  .to(techStack, { opacity: 1, duration: 0.6, ease: 'power1.out' }, '-=0.3')
}

export function initGlobeScrollReveal() {
  const globe = document.querySelector('#partners-globe')
  const trigger = document.querySelector('#globe-intro')
  if (!globe || !trigger) return

  gsap.set(globe, { opacity: 0, scale: 0.15, y: -400, transformOrigin: 'center top' })

  gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: 'top 80%',
      end: 'bottom top',
      scrub: 1,
    }
  })
  .to(globe, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power2.out' })
}