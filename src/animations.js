import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import { TextPlugin } from 'gsap/TextPlugin'
gsap.registerPlugin(TextPlugin)

// Efeito de "digitando em tempo real" nos mockups de notebook
gsap.registerPlugin(TextPlugin)

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

    xPercent -= e.deltaY * 0.01 // vai crescendo/diminuindo sem parar, sem trava

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