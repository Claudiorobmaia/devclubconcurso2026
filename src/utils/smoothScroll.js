import Lenis from "lenis";
import gsap from "gsap";

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  // Sincroniza o loop do Lenis com o ticker do GSAP,
  // em vez de deixar cada um rodar seu próprio requestAnimationFrame
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Desliga o "lag smoothing" automático do GSAP.
  // Ele existe pra suavizar quedas de FPS, mas conflita com o
  // controle de scroll que o Lenis já está fazendo — pode gerar
  // saltos estranhos ao trocar de aba e voltar, por exemplo.
  gsap.ticker.lagSmoothing(0);

  return lenis;
}