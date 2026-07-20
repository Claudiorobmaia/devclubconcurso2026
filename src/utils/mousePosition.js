// ============================================================
// mousePosition.js
// ------------------------------------------------------------
// Utilitário compartilhado que rastreia a posição do mouse.
//
// Por que existe:
// HeroLogo (tilt 3D) e mouseGlow (luz que segue o cursor)
// precisam da mesma informação. Em vez de cada arquivo ter seu
// próprio listener de "mousemove", centralizamos aqui — um único
// listener, vários "assinantes" (subscribers).
//
// Como funciona (padrão Observer):
// Qualquer arquivo pode chamar subscribeMousePosition(callback).
// Toda vez que a posição atualizar, o callback é chamado com os
// dados mais recentes. Isso é o mesmo princípio de "addEventListener",
// só que já vem com o throttle de performance pronto.
//
// Cuidado de performance:
// "mousemove" dispara dezenas de vezes por segundo. Atualizar o
// DOM a cada disparo é desperdício. Por isso usamos
// requestAnimationFrame (rAF): no máximo 1 atualização por frame
// de tela (~60x por segundo), não importa a frequência do evento.
// ============================================================

const subscribers = new Set()

const latestMouse = { x: 0, y: 0 }
let frameRequested = false

function notifySubscribers() {
  const { innerWidth, innerHeight } = window
  const { x, y } = latestMouse

  const position = {
    x,
    y,
    // normalizedX / normalizedY vão de -1 (esquerda/topo) a 1
    // (direita/base), 0 = centro da tela. Útil para tilt 3D.
    normalizedX: (x / innerWidth) * 2 - 1,
    normalizedY: (y / innerHeight) * 2 - 1,
  }

  subscribers.forEach((callback) => callback(position))
}

function handleMouseMove(event) {
  latestMouse.x = event.clientX
  latestMouse.y = event.clientY

  // Trava para garantir no máximo 1 rAF agendado por vez.
  if (!frameRequested) {
    frameRequested = true
    requestAnimationFrame(() => {
      notifySubscribers()
      frameRequested = false
    })
  }
}

// O listener global só é criado UMA vez, na primeira vez que
// alguém assina — não a cada import do arquivo.
let listenerStarted = false
function ensureListenerStarted() {
  if (listenerStarted) return
  window.addEventListener('mousemove', handleMouseMove)
  listenerStarted = true
}

// Função pública: outros arquivos chamam isso para "escutar"
// a posição do mouse. Retorna uma função de "unsubscribe", para
// poder remover a escuta quando não for mais necessária.
export function subscribeMousePosition(callback) {
  ensureListenerStarted()
  subscribers.add(callback)

  return function unsubscribe() {
    subscribers.delete(callback)
  }
}
