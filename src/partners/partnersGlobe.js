import * as THREE from 'three'
import gsap from 'gsap'


// ==== Ajustes fáceis de mexer depois ====
const LON_STEPS = 300        // pontos ao redor do equador
const LAT_STEPS = 150        // "anéis" do polo sul ao polo norte
const LAND_THRESHOLD = 128   // 0-255 — acima disso conta como "terra"
const INVERT_MASK = false    // true se sua imagem for terra=preto, oceano=branco
const GLOBE_COLOR = 0x8b5cf6 // roxo da paleta do site (mesmo tom do rgba(139,92,246) que já usa)
const POINT_SIZE = 0.015

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
  createLocationHighlights(points, positions)

  function animate() {
    points.rotation.y += 0.0015
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()

  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
  })
}

const HIGHLIGHT_COUNT = 6          // quantos pontos acesos ao mesmo tempo
const HIGHLIGHT_SWAP_INTERVAL = 4000 // a cada quantos ms um ponto pula pra outro lugar

function createLocationHighlights(parentPoints, landPositions) {
  // landPositions é um array "achatado" tipo [x,y,z,x,y,z,...]
  // aqui convertemos pra uma lista de Vector3, mais fácil de sortear
  const landVectors = []
  for (let i = 0; i < landPositions.length; i += 3) {
    landVectors.push(
      new THREE.Vector3(landPositions[i], landPositions[i + 1], landPositions[i + 2])
    )
  }

  const markerGeometry = new THREE.SphereGeometry(0.025, 8, 8)

  for (let i = 0; i < HIGHLIGHT_COUNT; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x76f898,
      transparent: true,
      opacity: 0,
    })

    const marker = new THREE.Mesh(markerGeometry, material)
    moveMarkerToRandomLand(marker, landVectors)
    parentPoints.add(marker) // filho do mesmo objeto que já gira — herda a rotação de graça

    pulseMarker(material, i * 0.4) // delay diferente por marcador, pra não piscarem todos juntos

    // a cada X segundos, esse marcador "pula" pra outro lugar aleatório
    setInterval(() => {
      moveMarkerToRandomLand(marker, landVectors)
    }, HIGHLIGHT_SWAP_INTERVAL + i * 300)
  }
}

function moveMarkerToRandomLand(marker, landVectors) {
  const randomPoint = landVectors[Math.floor(Math.random() * landVectors.length)]
  marker.position.copy(randomPoint)
}

function pulseMarker(material, delay) {
  gsap.to(material, {
    opacity: 1,
    duration: 1,
    delay,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}