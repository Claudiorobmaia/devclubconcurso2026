import gsap from "gsap";
import { HERO_TITLE } from "../animations.js";

export function renderHeroTitle() {
  const lines = document.querySelectorAll(".hero-title-line");

  if (!lines.length) return;

  // Estado inicial: linhas deslocadas para baixo
  gsap.set(lines, {
    y: HERO_TITLE.yOffset,
  });

  // Animação de entrada: sobe + fade in, em cascata
  gsap.to(lines, {
    opacity: 1,
    y: 0,
    duration: HERO_TITLE.duration,
    stagger: HERO_TITLE.stagger,
    ease: HERO_TITLE.ease,
    delay: HERO_TITLE.delay,
  });
}