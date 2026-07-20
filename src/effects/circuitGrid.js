import gsap from 'gsap'
import { CIRCUIT_GRID } from '../animations.js'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function initCircuitGrid() {
  const container = document.querySelector('#circuit-grid')
  if (!container) return

  // Camada 1: a malha em si — puro CSS, dois gradientes repetidos
  // (um horizontal, um vertical) sobrepostos formam a grade.
  const gridLayer = document.createElement('div')
  gridLayer.style.cssText = `
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(167, 139, 250, ${CIRCUIT_GRID.lineOpacity}) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(167, 139, 250, ${CIRCUIT_GRID.lineOpacity}) 1px, transparent 1px);
    background-size: ${CIRCUIT_GRID.gridSize}px ${CIRCUIT_GRID.gridSize}px;
  `
  container.appendChild(gridLayer)

  // Camada 2: nós que "acendem" em pontos aleatórios da grade —
  // sempre alinhados aos cruzamentos, nunca soltos no meio das células.
  function spawnNode() {
    const cols = Math.floor(window.innerWidth / CIRCUIT_GRID.gridSize)
    const rows = Math.floor(window.innerHeight / CIRCUIT_GRID.gridSize)

    const col = Math.floor(Math.random() * cols)
    const row = Math.floor(Math.random() * rows)

    const node = document.createElement('div')
    node.style.cssText = `
      position: absolute;
      left: ${col * CIRCUIT_GRID.gridSize}px;
      top: ${row * CIRCUIT_GRID.gridSize}px;
      width: ${CIRCUIT_GRID.nodeSize}px;
      height: ${CIRCUIT_GRID.nodeSize}px;
      margin-left: -${CIRCUIT_GRID.nodeSize / 2}px;
      margin-top: -${CIRCUIT_GRID.nodeSize / 2}px;
      border-radius: 50%;
      background: ${CIRCUIT_GRID.nodeColor};
      box-shadow: ${CIRCUIT_GRID.nodeGlow};
      opacity: 0;
      transform: scale(0);
    `
    container.appendChild(node)

    gsap.timeline({ onComplete: () => node.remove() })
      .to(node, { opacity: 1, scale: 1, duration: CIRCUIT_GRID.pulseDuration * 0.3, ease: 'power2.out' })
      .to(node, { opacity: 0, scale: 0.6, duration: CIRCUIT_GRID.pulseDuration * 0.7, ease: 'power2.in' })
  }

  let timeoutId
  function loop() {
    spawnNode()
    const nextDelay = randomBetween(CIRCUIT_GRID.minInterval, CIRCUIT_GRID.maxInterval)
    timeoutId = setTimeout(loop, nextDelay)
  }
  loop()

  return function cleanup() {
    clearTimeout(timeoutId)
    container.innerHTML = ''
  }
}