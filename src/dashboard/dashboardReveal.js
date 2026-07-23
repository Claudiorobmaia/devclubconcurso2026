import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function renderDashboardReveal() {
  const card = document.querySelector(".reveal-card");
  if (!card) return;

  const lines = gsap.utils.toArray(".reveal-line", card);

  // Verifica se o card já está visível na tela ao carregar a página
  const rect = card.getBoundingClientRect();
  const jaVisivel = rect.top < window.innerHeight * 0.8;

  const tl = gsap.timeline({
    delay: jaVisivel ? 0.6 : 0,
    scrollTrigger: jaVisivel
      ? null // já visível: toca direto, sem depender de scroll
      : {
          trigger: card,
          start: "top 80%",
          once: true,
        },
  });

  tl.from(card, {
    y: 40,
    opacity: 0,
    scale: 0.97,
    duration: 0.8,
    ease: "power3.out",
  }).from(
    lines,
    {
      opacity: 0,
      y: 12,
      duration: 0.5,
      stagger: 0.15,
      ease: "power2.out",
    },
    "-=0.3"
  );

  gsap.to("#dashboard-play-btn", {
    boxShadow: "0 0 0 12px rgba(147, 51, 234, 0)",
    duration: 1.4,
    repeat: -1,
    ease: "power2.out",
  });
}