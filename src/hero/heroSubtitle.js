import gsap from 'gsap'
import { SUBTITLE_FADE } from '../animations.js'

export function renderHeroSubtitle() {
  const subtitle = document.querySelector('#hero-subtitle')
  if (!subtitle) return

  // gsap.fromTo: define o estado INICIAL (from) e o estado FINAL (to)
  // explicitamente, em vez de confiar só na classe opacity-0 do HTML.
  // Isso é mais seguro: mesmo que o CSS mude no futuro, a animação
  // continua correta porque o "de onde parte" está aqui no JS também.
  gsap.fromTo(
    subtitle,
    {
      opacity: 0,
      y: SUBTITLE_FADE.yOffset, // começa 20px mais baixo
    },
    {
      opacity: 1,
      y: 0, // termina na posição natural
      duration: SUBTITLE_FADE.duration,
      delay: SUBTITLE_FADE.delay,
      ease: SUBTITLE_FADE.ease,
    }
  )
}