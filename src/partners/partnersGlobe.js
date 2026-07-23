import * as THREE from 'three'
import gsap from 'gsap'


// ==== Ajustes fáceis de mexer depois ====
const LON_STEPS = 300        // pontos ao redor do equador
const LAT_STEPS = 150        // "anéis" do polo sul ao polo norte
const LAND_THRESHOLD = 128   // 0-255 — acima disso conta como "terra"
const INVERT_MASK = false    // true se sua imagem for terra=preto, oceano=branco
const GLOBE_COLOR = 0x8b5cf6 // roxo da paleta do site (mesmo tom do rgba(139,92,246) que já usa)
const POINT_SIZE = 0.015

// ==== Ajustes do destaque de países ====
const HIGHLIGHT_COUNT = 6          // quantos pontos acesos ao mesmo tempo
const HIGHLIGHT_COLOR = 0x76f898   // cor do ponto que pisca
const LINE_COLOR_CSS = '#ffffff'   // linha e texto agora em branco
const LINE_WIDTH = '0.75'          // mais fina que antes
const LINE_LENGTH = 0.35           // quanto a linha se projeta pra fora da esfera (em unidades 3D)
const GROW_DURATION = 0.8          // segundos pra linha+texto aparecerem
const HOLD_DURATION = 2.2          // segundos que ficam totalmente visíveis
const SHRINK_DURATION = 0.6        // segundos pra linha+texto sumirem
const STAGGER_DELAY = 0.4          // atraso entre o ciclo de um marcador e o do próximo

// Lista genérica de países pra rotular os pontos (nome + lat/lon aproximados
// da capital ou centro do país). Troque/expanda essa lista quando quiser.
const LOCATIONS = [
  { name: 'Brasil', lat: -15.8, lon: -47.9 },
  { name: 'Estados Unidos', lat: 38.9, lon: -77.0 },
  { name: 'Reino Unido', lat: 51.5, lon: -0.12 },
  { name: 'Alemanha', lat: 52.5, lon: 13.4 },
  { name: 'Portugal', lat: 38.7, lon: -9.1 },
  { name: 'França', lat: 48.85, lon: 2.35 },
  { name: 'Espanha', lat: 40.4, lon: -3.7 },
  { name: 'Itália', lat: 41.9, lon: 12.5 },
  { name: 'Canadá', lat: 45.4, lon: -75.7 },
  { name: 'Japão', lat: 35.7, lon: 139.7 },
  { name: 'Índia', lat: 28.6, lon: 77.2 },
  { name: 'China', lat: 39.9, lon: 116.4 },
  { name: 'Austrália', lat: -35.3, lon: 149.1 },
  { name: 'México', lat: 19.4, lon: -99.1 },
  { name: 'Argentina', lat: -34.6, lon: -58.4 },
  { name: 'África do Sul', lat: -25.7, lon: 28.2 },
]

export function renderPartnersGlobe() {
  const container = document.getElementById('partners-globe')
  if (!container) return

  // Carrega a imagem do mapa ANTES de montar a cena 3D — sem ela, não
  // temos como saber quais pontos são terra ou oceano.
  const image = new Image()
  image.src = '/earth-landmask.png'
  image.onload = () => {
    const positions = buildLandPoints(image)
    initScene(container, positions)
  }
}

// Lê a imagem num canvas escondido e devolve só as posições 3D
// dos pontos que caem em cima de terra firme.
function buildLandPoints(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const positions = []

  for (let latIndex = 0; latIndex <= LAT_STEPS; latIndex++) {
    const lat = (latIndex / LAT_STEPS) * 180 - 90 // -90° a +90°

    for (let lonIndex = 0; lonIndex < LON_STEPS; lonIndex++) {
      const lon = (lonIndex / LON_STEPS) * 360 // 0° a 360°

      // Converte a coordenada geográfica numa posição de pixel na imagem
      const px = Math.floor((lon / 360) * canvas.width)
      const py = Math.floor(((90 - lat) / 180) * canvas.height)
      const pixelIndex = (py * canvas.width + px) * 4
      const brightness = data[pixelIndex] // canal R — a imagem é P&B, então basta 1 canal

      const isLand = INVERT_MASK ? brightness < LAND_THRESHOLD : brightness > LAND_THRESHOLD
      if (!isLand) continue // pula o ponto se cair no oceano

      positions.push(...latLonToVector3(lat, lon, 1))
    }
  }

  return positions
}

// Fórmula padrão de trigonometria: converte latitude/longitude numa
// posição (x, y, z) na superfície de uma esfera de raio 1.
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return [x, y, z]
}

function initScene(container, positions) {
  const width = container.clientWidth
  const height = container.clientHeight

  // O overlay de linhas/texto é HTML por cima do canvas — por isso o
  // container precisa ser um "positioning context".
  container.style.position = container.style.position || 'relative'

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 0, 3.2)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // Em vez da SphereGeometry genérica, agora construímos a geometria
  // manualmente, só com os pontos que sobraram do filtro de terra/oceano.
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: GLOBE_COLOR,
    size: POINT_SIZE,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // Nuvem de vetores de terra, usada só pra "encaixar" (snap) os países
  // da nossa lista genérica no ponto real mais próximo já renderizado.
  const landVectors = []
  for (let i = 0; i < positions.length; i += 3) {
    landVectors.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]))
  }
  const snappedLocations = snapLocationsToLand(LOCATIONS, landVectors)

  const overlay = createOverlay(container, width, height)
  const highlights = createLocationHighlights(points, overlay, snappedLocations)

  function animate() {
    points.rotation.y += 0.0015
    renderer.render(scene, camera)
    // Roda DEPOIS do render, pra garantir que as matrizes de mundo dos
    // marcadores (que giram junto com `points`) já estão atualizadas.
    updateHighlightsScreenPositions(highlights, camera, container)
    requestAnimationFrame(animate)
  }
  animate()

  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
    overlay.svg.setAttribute('viewBox', `0 0 ${newWidth} ${newHeight}`)
  })
}

// Pra cada país da lista, acha o ponto de terra JÁ RENDERIZADO mais
// próximo da coordenada real dele — evita marcador "flutuando" na água
// por causa da máscara ser uma versão estilizada da Terra.
function snapLocationsToLand(locations, landVectors) {
  return locations.map((location) => {
    const target = new THREE.Vector3(...latLonToVector3(location.lat, location.lon, 1))

    let closest = landVectors[0]
    let bestDot = -Infinity // dot product máximo = menor distância angular (ambos raio 1)

    for (const candidate of landVectors) {
      const dot = candidate.dot(target)
      if (dot > bestDot) {
        bestDot = dot
        closest = candidate
      }
    }

    return { name: location.name, vector: closest.clone() }
  })
}

// Cria o SVG transparente que fica por cima do canvas, só pra desenhar
// as linhas — os textos são divs HTML soltos (fonte nítida, fácil de estilizar).
function createOverlay(container, width, height) {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.inset = '0'
  wrapper.style.pointerEvents = 'none' // deixa cliques passarem direto pro que tiver embaixo

  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.position = 'absolute'
  svg.style.inset = '0'

  wrapper.appendChild(svg)
  container.appendChild(wrapper)

  return { wrapper, svg }
}

function createLocationHighlights(parentPoints, overlay, snappedLocations) {
  const markerGeometry = new THREE.SphereGeometry(0.025, 8, 8)
  const svgNS = 'http://www.w3.org/2000/svg'
  const highlights = []

  for (let i = 0; i < HIGHLIGHT_COUNT; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: HIGHLIGHT_COLOR,
      transparent: true,
      opacity: 0,
    })
    const marker = new THREE.Mesh(markerGeometry, material)
    parentPoints.add(marker) // filho do mesmo objeto que já gira — herda a rotação de graça

    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('stroke', LINE_COLOR_CSS)
    line.setAttribute('stroke-width', LINE_WIDTH)
    overlay.svg.appendChild(line)

    const label = document.createElement('div')
    label.className = 'absolute text-xs font-medium whitespace-nowrap'
    label.style.color = LINE_COLOR_CSS
    label.style.transform = 'translate(-50%, -50%)'
    label.style.opacity = '0'
    overlay.wrapper.appendChild(label)

    const highlight = {
      marker,
      material,
      line,
      label,
      progress: { value: 0 }, // 0 = escondido, 1 = totalmente visível
      innerWorld: new THREE.Vector3(),
      outerWorld: new THREE.Vector3(),
    }

    highlights.push(highlight)

    // Atraso escalonado pra não nascerem todos juntos
    gsap.delayedCall(i * STAGGER_DELAY, () => runHighlightCycle(highlight, snappedLocations))
  }

  return highlights
}

// Sorteia um país (já "encaixado" na terra) e reposiciona o marcador nele.
function moveMarkerToRandomLocation(highlight, snappedLocations) {
  const location = snappedLocations[Math.floor(Math.random() * snappedLocations.length)]
  highlight.marker.position.copy(location.vector)
  highlight.label.textContent = location.name
}

// O ciclo de vida de um marcador: aparece -> segura -> some -> escolhe
// outro país -> repete. Um único valor de progresso (0 a 1) comanda a
// opacidade do ponto, o comprimento da linha e a opacidade do texto ao
// mesmo tempo, então tudo cresce/encolhe na mesma proporção.
function runHighlightCycle(highlight, snappedLocations) {
  moveMarkerToRandomLocation(highlight, snappedLocations)

  gsap.to(highlight.progress, {
    value: 1,
    duration: GROW_DURATION,
    ease: 'power2.out',
    onUpdate: () => applyProgress(highlight),
  })

  gsap.delayedCall(GROW_DURATION + HOLD_DURATION, () => {
    gsap.to(highlight.progress, {
      value: 0,
      duration: SHRINK_DURATION,
      ease: 'power2.in',
      onUpdate: () => applyProgress(highlight),
      onComplete: () => runHighlightCycle(highlight, snappedLocations), // recomeça com outro país
    })
  })
}

function applyProgress(highlight) {
  highlight.material.opacity = highlight.progress.value
  // line/label opacity é recalculada no loop de frame (updateHighlightsScreenPositions),
  // porque também depende de estar de frente ou atrás do globo.
}

// Roda todo frame: projeta a posição 3D real do marcador (considerando a
// rotação do globo) pra coordenada de tela, decide se está de frente pra
// câmera, e reposiciona a linha/texto de acordo.
function updateHighlightsScreenPositions(highlights, camera, container) {
  const width = container.clientWidth
  const height = container.clientHeight

  for (const highlight of highlights) {
    if (highlight.progress.value <= 0) {
      highlight.line.style.opacity = '0'
      highlight.label.style.opacity = '0'
      continue
    }

    highlight.marker.getWorldPosition(highlight.innerWorld)

    // Está de frente? Compara a normal do ponto (sua própria direção a
    // partir do centro da esfera) com a direção até a câmera — se
    // apontam pro mesmo lado, o ponto está no hemisfério visível.
    const normal = highlight.innerWorld.clone().normalize()
    const toCamera = camera.position.clone().sub(highlight.innerWorld).normalize()
    const isFacingCamera = normal.dot(toCamera) > 0

    const visibility = isFacingCamera ? highlight.progress.value : 0

    highlight.outerWorld
      .copy(highlight.innerWorld)
      .normalize()
      .multiplyScalar(highlight.innerWorld.length() + LINE_LENGTH)

    const innerScreen = toScreenPosition(highlight.innerWorld, camera, width, height)
    const outerScreen = toScreenPosition(highlight.outerWorld, camera, width, height)

    // A ponta da linha avança em direção ao texto conforme o progresso sobe
    const tipX = innerScreen.x + (outerScreen.x - innerScreen.x) * highlight.progress.value
    const tipY = innerScreen.y + (outerScreen.y - innerScreen.y) * highlight.progress.value

    highlight.line.setAttribute('x1', innerScreen.x)
    highlight.line.setAttribute('y1', innerScreen.y)
    highlight.line.setAttribute('x2', tipX)
    highlight.line.setAttribute('y2', tipY)
    highlight.line.style.opacity = String(visibility)

    highlight.label.style.left = `${outerScreen.x}px`
    highlight.label.style.top = `${outerScreen.y}px`
    highlight.label.style.opacity = String(visibility)
  }
}

function toScreenPosition(vector3, camera, width, height) {
  const projected = vector3.clone().project(camera)
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
  }
}