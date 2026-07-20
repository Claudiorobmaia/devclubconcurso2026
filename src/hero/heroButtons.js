import gsap from "gsap";
import { HERO_BUTTONS } from "../animations.js";

export function renderHeroButtons() {
  const container = document.querySelector("#hero-buttons");
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
      <button class="hero-btn-primary px-8 py-4 rounded-full font-semibold text-white
        bg-gradient-to-r from-purple-600 to-indigo-500
        shadow-lg shadow-purple-600/30">
        Comece Agora
      </button>
      <button class="hero-btn-secondary px-8 py-4 rounded-full font-semibold
        text-gray-200 border border-gray-600">
        Saiba Mais
      </button>
    </div>
  `;

  const buttons = container.querySelectorAll("button");
  buttons.forEach(initMagneticEffect);
}
function initMagneticEffect(button) {
  let rect = button.getBoundingClientRect();

  // Recalcula o rect apenas no resize — nunca dentro do mousemove
  window.addEventListener("resize", () => {
    rect = button.getBoundingClientRect();
  });

  const xTo = gsap.quickTo(button, "x", {
    duration: HERO_BUTTONS.duration,
    ease: HERO_BUTTONS.ease,
  });
  const yTo = gsap.quickTo(button, "y", {
    duration: HERO_BUTTONS.duration,
    ease: HERO_BUTTONS.ease,
  });

  button.addEventListener("mousemove", (e) => {
    rect = button.getBoundingClientRect(); // posição pode mudar com scroll
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);

    xTo(relX * HERO_BUTTONS.magneticStrength);
    yTo(relY * HERO_BUTTONS.magneticStrength);
  });

  button.addEventListener("mouseleave", () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: HERO_BUTTONS.resetDuration,
      ease: HERO_BUTTONS.resetEase,
    });
  });
}