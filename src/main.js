import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { renderHeroBackground } from './hero/heroBackground.js'
import { renderMouseGlow } from './hero/mouseGlow.js'
import { renderHeroLogo } from './hero/heroLogo.js'
import { renderHeroSubtitle } from './hero/heroSubtitle.js'
import { renderHeroTitle } from './hero/heroTitle.js'
import { renderHeroButtons } from './hero/heroButtons.js'
import { renderHeroTechStack } from './hero/heroTechStack.js'
import { initHeroScrollReveal, initGlobeScrollReveal } from './hero/heroScrollReveal.js'
import { initSmoothScroll } from './utils/smoothScroll.js'
import { initCircuitGrid } from './effects/circuitGrid.js'
import { ParticleCard } from './effects/particleCard.js'
import { renderPartnersGlobe } from './partners/partnersGlobe.js'
import { initDockNavbar } from './effects/dockNavbar.js'
import { getCourseColor } from './config/courseColors.js'
import { renderDashboardReveal } from './dashboard/dashboardReveal.js'
import './animations.js'


initSmoothScroll()
initCircuitGrid()

renderHeroBackground()
renderMouseGlow()
renderHeroLogo()
renderHeroTechStack()
initHeroScrollReveal()
renderHeroSubtitle()
renderHeroButtons()
renderHeroTitle()
renderPartnersGlobe()
initGlobeScrollReveal()
renderDashboardReveal()


initDockNavbar('#dock-nav', {
  maxScale: 5,
  minScale: 1,
  influence: 110,
  lift: 20,
  
})



// Smooth scroll
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// Dados carregados do JSON
let courses = []
let partners = []
let faqs = []
let socials = []
let coursesBadges = []

async function loadData() {
  try {
    // Buscar o arquivo data.json
    const response = await fetch('/data.json')

    // Se não conseguir buscar, retorna erro
    if (!response.ok) {
      throw new Error('Erro ao carregar dados')
    }

    // Converter a resposta para JSON
    const data = await response.json()

    // Guardar os dados nas variáveis
    courses = data.courses
    partners = data.partners
    faqs = data.faqs
    socials = data.socials
    coursesBadges = data.coursesBadges

    // Agora que os dados carregaram, renderizar tudo
    renderCourses()
    renderPartners()
    renderFAQs()
    renderSocials()
    renderCoursesBadges()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
}

// Executar quando a página carregar
loadData()

// Função que renderiza (desenha) os cards dos cursos
function renderCourses() {
  const container = document.getElementById('courses-grid')

  if (!container) {
    console.warn('Container de cursos não encontrado')
    return
  }

  // Evita duplicação
  container.innerHTML = ''

  courses.forEach((course) => {
    const colorInfo = getCourseColor(course.color)

    const card = document.createElement('div')
    card.className =
      'relative rounded-3xl p-8 text-center border border-white/15'

    card.innerHTML = `
      <div class="relative z-[2]">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-5 shadow-lg">
          <img
  src="${course.icon}"
  alt="${course.title}"
  class="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
/>
        </div>

        <h3 class="text-white font-semibold text-lg mb-2">
          ${course.title}
        </h3>

        <p class="text-gray-400 text-sm mb-5">
          ${course.description}
        </p>

        <span class="inline-flex items-center gap-1 text-gray-500 text-xs">
          🕐 ${course.hours}
        </span>
      </div>
    `

    container.appendChild(card)

    new ParticleCard(card, {
      color: colorInfo.hex,
      count: 70,
      influenceRadius: 90,
      intensity: 1,
      speed: 1,
    })
  })
}

// Renderização das empresas parceiras
function renderPartners() {
  // Buscar o container
  const container = document.getElementById('partners-grid')

  if (!container) {
    console.warn('Container de parceiros não encontrado')
    return
  }

  // Para cada empresa
  partners.forEach((partner) => {
    // Criar uma div
    const partnerCard = document.createElement('div')
    partnerCard.className = 'reveal'

    // Adicionar o HTML
    partnerCard.innerHTML = `
      <div class="flex items-center justify-center gap-3 py-10 border-b md:border-r border-white/10">
        <div class="w-9 h-9 flex items-center justify-center">
          <img
            src="${partner.logo}"
            alt="${partner.name}"
            class="w-8 h-8 object-contain"
          />
        </div>
        <span class="text-gray-300 font-medium text-sm tracking-wide">
          ${partner.name}
        </span>
      </div>
    `

    // Adicionar na página
    container.appendChild(partnerCard)
  })

  gsap.utils.toArray('#partners-grid .reveal').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power3.out',
      delay: i * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
      },
    })
  })
}

// Renderização do FAQ
function renderFAQs() {
  // Buscar o container
  const container = document.getElementById('faqs-container')

  if (!container) {
    console.warn('Container de FAQs não encontrado')
    return
  }

  // Para cada pergunta
  faqs.forEach((faq) => {
    // Criar um elemento details (accordion)
    const details = document.createElement('details')
    details.className = 'group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden'

    // Adicionar o HTML
    details.innerHTML = `
      <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
        <span class="text-white font-medium text-sm md:text-base">${faq.question}</span>
        <span class="shrink-0 text-purple-400 text-xl leading-none transition-transform group-open:rotate-45">+</span>
      </summary>
      <div class="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
        ${faq.answer}
      </div>
    `

    // Adicionar na página
    container.appendChild(details)
  })
}

function renderSocials() {
  const container = document.getElementById('socials-container')

  if (!container) {
    console.warn('Container de sociais não encontrado')
    return
  }

  container.innerHTML = ''

  socials.forEach((social) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'dock-item-wrapper group relative hover:z-50'

    const tooltip = document.createElement('span')
    tooltip.className =
      'dock-tooltip z-30 absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-white text-xs px-2.5 py-1 rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none'
    tooltip.textContent = social.name

    const link = document.createElement('a')
    link.href = social.url || '#'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'

    link.className =
      'dock-item [transform-origin:bottom] w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-300'

    const img = document.createElement('img')
    img.src = social.icon
    img.alt = social.name
    img.className = 'w-6 h-6 object-contain'

    link.appendChild(img)
    wrapper.appendChild(tooltip)
    wrapper.appendChild(link)
    container.appendChild(wrapper)
  })

  initDockNavbar('#socials-container', {
    maxScale: 5,
    minScale: 1,
    influence: 110,
    lift: 20,
  })
}

// Renderização das badges dos cursos
function renderCoursesBadges() {
  const container = document.getElementById('badges-container')

  if (!container) {
    console.warn('Container de badges não encontrado')
    return
  }

  // Evita duplicação caso a função seja chamada novamente
  container.innerHTML = ''

  coursesBadges.forEach((badge) => {
    const span = document.createElement('span')

    span.className =
      'flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-2 backdrop-blur-sm'

    span.innerHTML = `
      <img
        src="${badge.icon}"
        alt="${badge.name}"
        class="w-5 h-5 object-contain"
      />
      <span class="text-white text-sm font-medium">
        ${badge.name}
      </span>
    `

    container.appendChild(span)
  })
}