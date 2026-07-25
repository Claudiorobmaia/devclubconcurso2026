import { gsap, ScrollTrigger } from './gsapSetup.js'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

// Efeito de "digitando em tempo real" nos mockups de notebook

function renderMentorCard(mentor) {
  const container = document.querySelector(`#mentor-${mentor.id}`)
  if (!container) return

  const chatHTML = mentor.chatMessages
    .map((msg) => {
      const classes = `chat-bubble bubble-${msg.type}`
      return `<div class="${classes}" data-text="${msg.text}"></div>`
    })
    .join('')

  container.innerHTML = `
    <div class="mentor-frame">
      <img class="mentor-frame-bg" src="${mentor.image}" alt="${mentor.name} em mentoria ao vivo" />
      <div class="mentor-chat-panel">
        <p class="mentor-chat-title">Chat</p>
        <div class="chat-thread-panel" id="chat-${mentor.id}">
          ${chatHTML}
        </div>
      </div>
    </div>
    <p class="text-white text-sm font-medium mt-3 text-center">${mentor.name}</p>
    <p class="text-gray-500 text-xs text-center">${mentor.role}</p>
  `
}

// Função auxiliar pra animar chat (mesmo padrão de antes)
function buildChatLoop(threadId) {
  const thread = document.querySelector(`#${threadId}`)
  if (!thread) return

  const bubbles = thread.querySelectorAll('.chat-bubble')
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, paused: true })

  bubbles.forEach((bubble) => {
    const fullText = bubble.dataset.text
    tl.to(bubble, { opacity: 1, y: 0, duration: 0.3 })
      .to(bubble, { duration: fullText.length * 0.03, text: fullText, ease: 'none' })
      .to({}, { duration: 0.7 })
  })

  tl.to(bubbles, { opacity: 0, y: 8, duration: 0.3, stagger: 0.05 })
    .set(bubbles, { text: '' })

  ScrollTrigger.create({
    trigger: thread,
    start: 'top 85%',
    once: true,
    onEnter: () => tl.play(),
  })
}

// Renderizar mentores do JSON
async function initMentors() {
  const res = await fetch('/data.json')
  const data = await res.json()
  
  data.mentors.forEach((mentor) => {
    renderMentorCard(mentor)
    buildChatLoop(`chat-${mentor.id}`)
  })
}

initMentors()

buildChatLoop('chat-bruno')
buildChatLoop('chat-sofia')
buildChatLoop('chat-rodrigo')

// Anima qualquer elemento com classe "reveal" conforme aparece na tela
document.querySelectorAll('.reveal').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
    },
  })
})

// Contador animado (para números tipo "+2000 alunos")
document.querySelectorAll('.counter').forEach((el) => {
  const target = Number(el.dataset.target)
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration: 2,
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onUpdate: () => (el.textContent = Math.floor(obj.val).toLocaleString('pt-BR')),
  })
})

// Carrossel de depoimentos: scroll do mouse, loop infinito real, efeito de profundidade
// Lista de depoimentos — pra adicionar/editar/remover, mexe só aqui
const testimonialsData = [
  { name: 'Larissa Rocha', handle: '@larocha.dev', gender: 'female', photoId: 44, text: 'Comecei sem saber nada de lógica e hoje sou dev pleno. A DevClub mudou o rumo da minha carreira e da minha vida financeira.' },
  { name: 'Rafael Souza', handle: '@rafasouzadev', gender: 'male', photoId: 32, text: 'Há um ano eu trabalhava de entregador. Hoje sou desenvolvedor full stack numa fintech ganhando 5x mais. A DevClub não ensina só código, ensina carreira.' },
  { name: 'Camila Martins', handle: '@camilamartins', gender: 'female', photoId: 68, text: 'Testei vários cursos antes e nenhum me colocou no mercado de verdade. Com a DevClub em 8 meses já estava empregada como front-end júnior.' },
  { name: 'Thiago Bezerra', handle: '@thibezerra', gender: 'male', photoId: 76, text: 'Saí do zero absoluto, nunca tinha escrito uma linha de código. Hoje trabalho remoto para uma empresa americana e triplicei minha renda.' },
  { name: 'Juliana Paiva', handle: '@julipaiva', gender: 'female', photoId: 21, text: 'Larguei um emprego que não me realizava para estudar na DevClub. Hoje sou analista de dados numa multinacional.' },
  { name: 'Marcos Andrade', handle: '@marcosdev', gender: 'male', photoId: 54, text: 'A qualidade do ensino e o suporte dos mentores são incomparáveis. Consegui minha vaga em menos de um ano.' },
]

function avatarUrl(gender, photoId) {
  const folder = gender === 'male' ? 'men' : 'women'
  return `https://randomuser.me/api/portraits/${folder}/${photoId}.jpg`
}

function buildTestimonialCard(person) {
  const card = document.createElement('div')
  card.className = 'w-80 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm'
  card.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
    <img src="${avatarUrl(person.gender, person.photoId)}" alt="${person.name}" class="w-11 h-11 rounded-full object-cover bg-white/10" loading="eager" />
      <div>
        <p class="text-white text-sm font-medium">${person.name}</p>
        <p class="text-gray-500 text-xs">${person.handle}</p>
      </div>
    </div>
    <p class="text-gray-300 text-sm leading-relaxed">${person.text}</p>
  `
  return card
}

function renderTestimonials() {
  const track = document.querySelector('#testimonials-track')
  if (!track) return

  // Renderiza a lista duas vezes seguidas (necessário pro loop infinito não ter "corte")
  const fullList = [...testimonialsData, ...testimonialsData]
  fullList.forEach((person) => {
    track.appendChild(buildTestimonialCard(person))
  })
}

renderTestimonials()
const testimonialsSection = document.querySelector('#testimonials-section')
const testimonialsTrack = document.querySelector('#testimonials-track')

if (testimonialsSection && testimonialsTrack) {
  let xPercent = 0 // valor livre, sem limite, pode crescer ou diminuir pra sempre
  const cards = testimonialsTrack.querySelectorAll(':scope > div')

  function updateDepth() {
  const containerRect = testimonialsSection.getBoundingClientRect()
  const centerX = containerRect.left + containerRect.width / 2

  cards.forEach((card) => {
    const cardRect = card.getBoundingClientRect()
    const cardCenterX = cardRect.left + cardRect.width / 2

    // distância COM sinal: negativo = card à esquerda do centro, positivo = à direita
    const signedDistance = cardCenterX - centerX
    const maxDistance = containerRect.width / 2

    // normalizado com sinal, de -1 (borda esquerda) a 1 (borda direita), 0 = centro
    const signedNormalized = Math.max(-1, Math.min(1, signedDistance / maxDistance))
    // normalizado absoluto, pra escala/opacidade/blur (não importa o lado)
    const normalized = Math.abs(signedNormalized)

    const scale = gsap.utils.mapRange(0, 1, 1, 0.5, normalized)
    const opacity = gsap.utils.mapRange(0, 1, 1, 0.15, normalized)
    const blur = gsap.utils.mapRange(0, 1, 0, 5, normalized)

    // quanto mais afastado do centro, mais inclinado e deslocado pra baixo
    const rotate = gsap.utils.mapRange(-1, 1, 20, -20, signedNormalized)
    const translateY = gsap.utils.mapRange(0, 1, 0, 50, normalized)

    gsap.set(card, {
      scale,
      opacity,
      filter: `blur(${blur}px)`,
      rotateZ: rotate,
      y: translateY,
    })
  })
}

  testimonialsSection.addEventListener('wheel', (e) => {
    e.preventDefault()

    xPercent -= e.deltaY * 0.009 // vai crescendo/diminuindo sem parar, sem trava

    gsap.to(testimonialsTrack, {
      xPercent: xPercent,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
      modifiers: {
        xPercent: gsap.utils.wrap(-50, 0), // "dá a volta" só na hora de desenhar
      },
      onUpdate: updateDepth,
    })
  }, { passive: false })

  updateDepth()
}

export const MOUSE_GLOW = {
  size: 500,          // px — diâmetro do círculo de luz
  duration: 0.6,       // segundos — suavização do "seguir o mouse"
  ease: 'power3',       // easing usado pelo quickTo (GSAP)
  fadeInDuration: 0.6,
}

export const LOGO_TILT = {
  maxRotation: 10,      // graus — o quanto o logo inclina no máximo (perceptível)
  duration: 0.5,         // segundos — suavização do quickTo
  ease: 'power2',         // easing do tilt
  perspective: 800,        // px — "profundidade" da cena 3D (menor = efeito mais forte)
}

export const SUBTITLE_FADE = {
  duration: 0.8,     // segundos
  delay: 0.3,          // espera antes de começar (deixa o logo/título aparecerem primeiro)
  ease: 'power2.out',
  yOffset: 20,          // px — sobe 20px de baixo pra cima enquanto aparece (leve, não exagerado)
}

export const HERO_TITLE = {
  duration: 1,
  stagger: 0.15,
  yOffset: 40,
  ease: "power3.out",
  delay: 0.2,
};

export const HERO_BUTTONS = {
  magneticStrength: 0.9,   // quanto o botão "segue" o mouse (0 a 1)
  duration: 0.5,            // suavização do movimento
  ease: "power3.out",
  resetDuration: 0.5,
  resetEase: "elastic.out(1, 0.4)", // efeito de "mola" ao soltar
};

export const HERO_LOGO_FOLLOW = {
  range: 900,   // deslocamento máximo da logo em px
  duration: 5,  // suavização do movimento
  ease: "power5.out",
};

export const HERO_LOGO_RETURN = {
  duration: 8.0,        // ajuste aqui — quanto maior, mais lenta a volta
  ease: 'elastic.out(1, 1.6)', // experimente também 'power3.out' se quiser sem "balanço"
}

export const HERO_TECH_STACK = {
  baseRadius: 100,      // raio do ícone mais próximo da logo (px)
  radiusStep: 15,       // cada ícone seguinte fica mais afastado — isso cria a espiral
  rotationSpeed: 1.5,   // velocidade da rotação (maior = gira mais rápido)
  followLag: 0.25,      // quão rápido o centro da espiral acompanha a logo ao mover
  fadeDuration: 0.4,
}

export const CIRCUIT_GRID = {
  gridSize: 60,          // espaçamento entre linhas, em px
  lineOpacity: 0.08,      // quão visível é a malha estática
  nodeSize: 4,            // diâmetro do "nó" que pulsa, em px
  nodeColor: 'rgba(199, 179, 255, 0.9)',
  nodeGlow: '0 0 14px rgba(167, 139, 250, 0.9)',
  minInterval: 3,       // intervalo mínimo entre um nó acender e outro (ms)
  maxInterval: 100,
  pulseDuration: 1.2,     // quanto tempo cada nó fica acendendo/apagando
}