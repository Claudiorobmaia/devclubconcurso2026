import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { TextPlugin } from 'gsap/TextPlugin'
import { renderHeroBackground } from './hero/heroBackground.js'
import { renderMouseGlow } from './hero/mouseGlow.js'
import { renderHeroLogo } from './hero/heroLogo.js'
import { renderHeroSubtitle } from './hero/heroSubtitle.js'
import { renderHeroTitle } from "./hero/heroTitle.js";
import { renderHeroButtons } from "./hero/heroButtons.js";
import { initSmoothScroll } from "./utils/smoothScroll.js";
import { renderHeroTechStack } from './hero/heroTechStack.js'
import { initCircuitGrid } from './effects/circuitGrid.js'


initSmoothScroll();
initCircuitGrid()
// ... aqui embaixo continuam suas chamadas render*() já existentes
renderHeroBackground()
renderMouseGlow()
renderHeroLogo()
renderHeroTechStack() 
renderHeroSubtitle()
renderHeroButtons() 
renderHeroTitle()

gsap.registerPlugin(ScrollTrigger)

// Smooth scroll
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

import './animations.js'

// Importar dados dos cursos
// Variáveis para armazenar os dados
let courses = []
let partners = []
let faqs = []
let socials = []
let coursesBadges = []

// Função que carrega os dados do JSON
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
  // Buscar o container onde os cards vão ficar
  const container = document.getElementById('courses-grid')
  
  if (!container) {
    console.warn('Container de cursos não encontrado')
    return
  }

  // Para cada curso no array
  courses.forEach(course => {
    // Criar uma div (elemento HTML)
    const card = document.createElement('div')
    
    // Adicionar classes e estrutura HTML
   card.innerHTML = `
  <div class="border-beam-card relative rounded-2xl border border-white/10 bg-gradient-to-b from-${course.color}-900/20 to-black/40 p-8 text-center overflow-hidden hover:border-white/20 transition">
    <div class="absolute inset-0 bg-${course.color}-500/10 blur-3xl rounded-full scale-75 -translate-y-10 mx-auto w-40 h-40 top-0 left-1/2 -translate-x-1/2"></div>
    <div class="relative">
      <div class="w-14 h-14 mx-auto rounded-full border border-${course.color}-500/30 flex items-center justify-center mb-5 text-${course.color}-400 text-2xl">
        ${course.icon}
      </div>
      <h3 class="text-white font-semibold text-lg mb-2">${course.title}</h3>
      <p class="text-gray-400 text-sm mb-5">${course.description}</p>
      <span class="inline-flex items-center gap-1 text-gray-500 text-xs">🕐 ${course.hours}</span>
    </div>
  </div>
`
    
    // Adicionar o card na página
    container.appendChild(card)
  })
}

// Importar dados das empresas


// Função que renderiza as empresas parceiras
function renderPartners() {
  // Buscar o container
  const container = document.getElementById('partners-grid')
  
  if (!container) {
    console.warn('Container de parceiros não encontrado')
    return
  }

  // Para cada empresa
  partners.forEach(partner => {
    // Criar uma div
    const partnerCard = document.createElement('div')
    partnerCard.className = 'reveal'
    
    // Adicionar o HTML
    partnerCard.innerHTML = `
      <div class="flex items-center justify-center gap-3 py-10 border-b md:border-r border-white/10">
        <div class="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 text-xs font-bold">${partner.abbr}</div>
        <span class="text-gray-300 font-medium text-sm tracking-wide">${partner.name}</span>
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

// Importar dados das FAQs


// Função que renderiza as perguntas do FAQ
function renderFAQs() {
  // Buscar o container
  const container = document.getElementById('faqs-container')
  
  if (!container) {
    console.warn('Container de FAQs não encontrado')
    return
  }

  // Para cada pergunta
  faqs.forEach(faq => {
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

// Importar dados de redes sociais


// Função que renderiza os links sociais
function renderSocials() {
  // Buscar o container
  const container = document.getElementById('socials-container')
  
  if (!container) {
    console.warn('Container de sociais não encontrado')
    return
  }

  // Para cada rede social
  socials.forEach(social => {
    // Criar um link
    const link = document.createElement('a')
    
    // Adicionar atributos
    link.href = '#'
    link.className = 'w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition'
    link.title = social.name
    
    // Adicionar o SVG
    link.innerHTML = social.icon
    
    // Adicionar na página
    container.appendChild(link)
  })
}

// Importar dados das badges


// Função que renderiza as badges de cursos
function renderCoursesBadges() {
  // Buscar o container
  const container = document.getElementById('badges-container')
  
  if (!container) {
    console.warn('Container de badges não encontrado')
    return
  }

  // Para cada badge
  coursesBadges.forEach(badge => {
    // Criar um span
    const span = document.createElement('span')
    
    // Adicionar classes e HTML
    span.className = 'flex items-center gap-2'
    span.innerHTML = `
      <span class="w-5 h-5 rounded bg-${badge.color}-500/20 border border-${badge.color}-400/30"></span> ${badge.name}
    `
    
    // Adicionar na página
    container.appendChild(span)
  })
}

gsap.set('#partners-visual', { transformOrigin: 'center center' })

gsap.from('#partners-visual', {
  scale: 0.7,
  ease: 'none',
  scrollTrigger: {
    trigger: '#partners-visual',
    start: 'top 90%',
    end: 'top 30%',
    scrub: true,
    markers: true,
  },
})