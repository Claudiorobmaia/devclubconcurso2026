/**
 * ParticleCard — campo de partículas interativo para cards.
 * Canvas API puro (sem libs externas). Feito para JS vanilla + Vite.
 *
 * Uso básico:
 *   import { ParticleCard } from './particle-card.js';
 *
 *   const instance = new ParticleCard(cardElement, {
 *     color: '#a855f7',
 *     count: 70,
 *     influenceRadius: 90,
 *     intensity: 1,
 *     speed: 1,
 *   });
 *
 *   // ao remover o card do DOM (ex: re-render da lista):
 *   instance.destroy();
 */

// ---- loop global compartilhado (1 único requestAnimationFrame p/ todos os cards) ----
const registry = new Set();
let rafId = null;
let lastTime = 0;

function tick(time) {
  const dt = Math.min((time - lastTime) / 16.6667, 2.5); // normaliza p/ ~60fps, cap p/ evitar saltos
  lastTime = time;
  registry.forEach((instance) => instance._update(time, dt));
  rafId = requestAnimationFrame(tick);
}

function ensureLoopRunning() {
  if (rafId === null) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }
}

function maybeStopLoop() {
  if (registry.size === 0 && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export class ParticleCard {
  /**
   * @param {HTMLElement} container - elemento do card (precisa position:relative)
   * @param {Object} opts
   * @param {number} opts.count - nº de partículas em desktop (default 70)
   * @param {string} opts.color - cor base das partículas / glow, em hex (default '#a855f7')
   * @param {number} opts.influenceRadius - raio de ação do cursor em px (default 90)
   * @param {number} opts.intensity - força de repulsão, 0.5–2 (default 1)
   * @param {number} opts.speed - multiplicador de velocidade, 0.5–2 (default 1)
   * @param {boolean} opts.tilt - habilita tilt 3D leve (default true)
   * @param {boolean} opts.glow - habilita glow seguindo o cursor (default true)
   * @param {boolean} opts.borderLight - habilita luz na borda (default true)
   */
  constructor(container, opts = {}) {
    this.container = container;
    this.opts = {
      count: 70,
      color: '#a855f7',
      influenceRadius: 90,
      intensity: 1,
      speed: 1,
      tilt: true,
      glow: true,
      borderLight: true,
      ...opts,
    };

    this.reducedMotion = prefersReducedMotion();
    this.finePointer = isFinePointer();

    // dispositivos sem hover preciso (mobile/tablet) ou reduced-motion: modo leve
    this.lightMode = !this.finePointer || this.reducedMotion;
    if (this.lightMode) {
      this.opts.count = Math.round(this.opts.count * 0.35);
      this.opts.tilt = false;
    }

    this.mouse = null; // {x, y} relativo ao container, ou null quando fora
    this.active = false;
    this.particles = [];

    this._buildDOM();
    this._bindEvents();
    this._resize();
    this._seedParticles();

    if (!this.reducedMotion) {
      registry.add(this);
      ensureLoopRunning();
    } else {
      // desenha um frame estático só, sem loop contínuo
      this._draw();
    }
  }

  _buildDOM() {
    const c = this.container;
    c.classList.add('particle-card');

    // canvas "estourado" pra fora do card, permite partículas escaparem sem clipar
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'particle-card__canvas';
    this.ctx = this.canvas.getContext('2d');
    c.prepend(this.canvas);

    if (this.opts.glow) {
      this.glowEl = document.createElement('div');
      this.glowEl.className = 'particle-card__glow';
      this.glowEl.style.setProperty('--glow-color', this._rgba(0.35));
      c.appendChild(this.glowEl);
    }

    if (this.opts.borderLight) {
      this.borderEl = document.createElement('div');
      this.borderEl.className = 'particle-card__border-light';
      c.appendChild(this.borderEl);
    }

    // garante que o conteúdo existente fique acima de tudo
    const content = c.querySelector(':scope > *:not(.particle-card__canvas):not(.particle-card__glow):not(.particle-card__border-light)');
    if (content) content.classList.add('particle-card__content');
  }

  _bindEvents() {
    this._onMove = this._onMove.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onLeave = this._onLeave.bind(this);
    this._onResize = this._onResize.bind(this);

    if (!this.lightMode) {
      this.container.addEventListener('pointermove', this._onMove);
      this.container.addEventListener('pointerenter', this._onEnter);
      this.container.addEventListener('pointerleave', this._onLeave);
    }

    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(this.container);
  }

  _onResize() {
    clearTimeout(this._resizeDebounce);
    this._resizeDebounce = setTimeout(() => {
      this._resize();
      this._seedParticles(); // realoca origens proporcionalmente ao novo tamanho
    }, 120);
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    // margem extra pra permitir partículas "escaparem" do card sem cortar
    this.overflow = Math.round(Math.min(this.width, this.height) * 0.18);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = this.width + this.overflow * 2;
    const ch = this.height + this.overflow * 2;

    this.canvas.width = cw * dpr;
    this.canvas.height = ch * dpr;
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;
    this.canvas.style.left = `${-this.overflow}px`;
    this.canvas.style.top = `${-this.overflow}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _seedParticles() {
    const { count } = this.opts;
    const cols = Math.ceil(Math.sqrt(count * (this.width / this.height)));
    const rows = Math.ceil(count / cols);
    const spacingX = this.width / cols;
    const spacingY = this.height / rows;

    this.particles = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (this.particles.length >= count) break;
        const ox = spacingX * (i + 0.5) + (Math.random() - 0.5) * spacingX * 0.6;
        const oy = spacingY * (j + 0.5) + (Math.random() - 0.5) * spacingY * 0.6;
        this.particles.push({
          ox: ox + this.overflow,
          oy: oy + this.overflow,
          x: ox + this.overflow,
          y: oy + this.overflow,
          vx: 0,
          vy: 0,
          r: 1 + Math.random() * 1.4,
          baseAlpha: 0.2 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          freq: 0.4 + Math.random() * 0.6,
          ampX: 2 + Math.random() * 2,
          ampY: 2 + Math.random() * 2,
        });
      }
    }
  }

  _onEnter() {
    this.active = true;
    this.container.classList.add('is-active');
  }

  _onMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.mouse = { x: x + this.overflow, y: y + this.overflow };

    if (this.opts.tilt) {
      const rx = ((y / rect.height) - 0.5) * -8; // graus
      const ry = ((x / rect.width) - 0.5) * 10;
      this.container.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      this.container.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    }

    if (this.glowEl) {
      this.container.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
      this.container.style.setProperty('--my', `${(y / rect.height) * 100}%`);
    }

    if (this.borderEl) {
      const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI);
      this.container.style.setProperty('--angle', `${angle.toFixed(1)}deg`);
    }
  }

  _onLeave() {
    this.active = false;
    this.mouse = null;
    this.container.classList.remove('is-active');
    if (this.opts.tilt) {
      this.container.style.setProperty('--rx', '0deg');
      this.container.style.setProperty('--ry', '0deg');
    }
  }

  _update(time, dt) {
    const { influenceRadius, intensity, speed } = this.opts;
    const t = time / 1000;

    for (const p of this.particles) {
      // flutuação ambiente (respiração sutil, sempre ativa)
      const idleX = Math.cos(t * p.freq + p.phase) * p.ampX;
      const idleY = Math.sin(t * p.freq + p.phase) * p.ampY;
      const targetX = p.ox + idleX;
      const targetY = p.oy + idleY;

      if (this.mouse) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist < influenceRadius) {
          const force = (1 - dist / influenceRadius) * intensity * 4.2;
          p.vx += (dx / dist) * force * dt;
          p.vy += (dy / dist) * force * dt;
        }
      }

      // mola de retorno à posição de origem
      p.vx += (targetX - p.x) * 0.06 * dt;
      p.vy += (targetY - p.y) * 0.06 * dt;

      // amortecimento
      p.vx *= 0.88;
      p.vy *= 0.88;

      p.x += p.vx * speed * dt;
      p.y += p.vy * speed * dt;
    }

    this._draw();
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width + this.overflow * 2, this.height + this.overflow * 2);

    for (const p of this.particles) {
      const speedMag = Math.hypot(p.vx, p.vy);

      // trilha curta, só quando a partícula está se movendo rápido o bastante
      if (speedMag > 0.6) {
        ctx.strokeStyle = this._rgba(Math.min(p.baseAlpha * 0.5, 0.3));
        ctx.lineWidth = p.r * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      const alpha = Math.min(p.baseAlpha + speedMag * 0.05, 0.9);
      ctx.beginPath();
      ctx.fillStyle = this._rgba(alpha);
      ctx.shadowColor = this._rgba(0.6);
      ctx.shadowBlur = 3;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  _rgba(alpha) {
    if (!this._rgb) {
      const hex = this.opts.color.replace('#', '');
      const bigint = parseInt(hex.length === 3
        ? hex.split('').map((c) => c + c).join('')
        : hex, 16);
      this._rgb = [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    return `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${alpha})`;
  }

  destroy() {
    registry.delete(this);
    maybeStopLoop();
    this._ro.disconnect();
    if (!this.lightMode) {
      this.container.removeEventListener('pointermove', this._onMove);
      this.container.removeEventListener('pointerenter', this._onEnter);
      this.container.removeEventListener('pointerleave', this._onLeave);
    }
    this.canvas.remove();
    if (this.glowEl) this.glowEl.remove();
    if (this.borderEl) this.borderEl.remove();
    this.container.classList.remove('particle-card', 'is-active');
  }
}