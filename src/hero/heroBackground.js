// ============================================================
// heroBackground.js
// ------------------------------------------------------------
// Camada de fundo estática do Hero: gradiente premium + grid
// discreto + glow ambiente (roxo/índigo). Sem interatividade —
// isso fica por conta do mouseGlow.js, renderizado por cima.
// ============================================================

export function renderHeroBackground() {
  const container = document.querySelector('#hero-background')
  if (!container) return

  container.className = 'absolute inset-0 overflow-hidden'

  container.innerHTML = `
    <div
      class="absolute inset-0"
      style="background:
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(147,51,234,0.15), transparent),
        linear-gradient(180deg, #05070A 0%, #0B1220 100%);"
    ></div>

    <div
      class="absolute inset-0 opacity-[0.07]"
      style="background-image:
        linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
        background-size: 48px 48px;"
    ></div>

    <div class="absolute flex justify-center w-full top-0">
      <div class="absolute top-0 w-[500px] h-[250px] bg-purple-600/40 blur-[100px] rounded-full"></div>
      <div class="absolute top-10 w-[300px] h-[300px] bg-indigo-500/50 blur-[80px] rounded-full"></div>
    </div>

    <div
      class="absolute inset-0"
      style="background:
        radial-gradient(ellipse 60% 60% at 50% 50%, transparent 40%, #05070A 100%);"
    ></div>
  `
}