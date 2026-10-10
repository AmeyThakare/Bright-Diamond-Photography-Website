// 240-Frame Luxury Scroll Animation Engine & HUD Story System for Bright Diamond Photography

const TOTAL_FRAMES = 240;
const FRAME_PREFIX = '/frames/ezgif-frame-';
const FRAME_EXT = '.jpg';

class BrightDiamondScrollApp {
  constructor() {
    this.container = document.querySelector('.scroll-sequence-container');
    this.viewport = document.querySelector('.sticky-canvas-viewport');
    this.canvas = document.getElementById('animation-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.preloader = document.getElementById('preloader');
    this.progressBar = document.getElementById('loader-bar-fill');
    this.statusText = document.getElementById('loader-status');

    // HUD Story Cards
    this.hudCards = Array.from(document.querySelectorAll('.hud-card'));

    this.images = [];
    this.loadedCount = 0;
    this.currentFrame = 0;
    this.targetFrame = 0;

    if (this.canvas && this.container) {
      this.init();
    }
  }

  async init() {
    this.setupCanvas();
    this.bindEvents();
    await this.preloadImages();
  }

  setupCanvas() {
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    window.addEventListener('resize', () => {
      this.renderFrame(Math.round(this.currentFrame));
    });
  }

  getFrameUrl(index) {
    const padded = String(index + 1).padStart(3, '0');
    return `${FRAME_PREFIX}${padded}${FRAME_EXT}`;
  }

  preloadImages() {
    return new Promise((resolve) => {
      let resolved = false;

      const onImageLoaded = () => {
        this.loadedCount++;
        const pct = Math.min(100, Math.round((this.loadedCount / TOTAL_FRAMES) * 100));
        
        if (this.progressBar) {
          this.progressBar.style.width = `${pct}%`;
        }
        if (this.statusText) {
          this.statusText.textContent = `LOADING EXPERIENCE (${pct}%)`;
        }

        if (this.loadedCount >= TOTAL_FRAMES && !resolved) {
          resolved = true;
          setTimeout(() => {
            if (this.preloader) {
              this.preloader.classList.add('loaded');
            }
            this.renderFrame(0);
            this.startLoop();
            resolve();
          }, 150);
        }
      };

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = this.getFrameUrl(i);
        img.onload = onImageLoaded;
        img.onerror = onImageLoaded;
        this.images.push(img);
      }
    });
  }

  renderFrame(frameIndex) {
    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));
    const img = this.images[clampedIndex];

    if (img && img.complete && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const cW = this.canvas.width;
      const cH = this.canvas.height;
      const iW = img.naturalWidth || 1920;
      const iH = img.naturalHeight || 1080;

      const scale = Math.min(cW / iW, cH / iH);
      const drawW = iW * scale;
      const drawH = iH * scale;
      const drawX = (cW - drawW) / 2;
      const drawY = (cH - drawH) / 2;

      this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    this.updateHUDCards(clampedIndex);
  }

  updateHUDCards(frameIndex) {
    this.hudCards.forEach((card) => {
      const min = parseInt(card.getAttribute('data-frame-min') || '0', 10);
      const max = parseInt(card.getAttribute('data-frame-max') || '239', 10);

      if (frameIndex >= min && frameIndex <= max) {
        if (!card.classList.contains('active')) {
          card.classList.add('active');
        }
      } else {
        if (card.classList.contains('active')) {
          card.classList.remove('active');
        }
      }
    });
  }

  startLoop() {
    const loop = () => {
      const diff = this.targetFrame - this.currentFrame;
      if (Math.abs(diff) > 0.01) {
        this.currentFrame += diff * 0.18;
        this.renderFrame(Math.round(this.currentFrame));
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  handleScroll() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const scrollHeight = rect.height - window.innerHeight;

    if (scrollHeight <= 0) return;

    const scrollProgress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
    this.targetFrame = scrollProgress * (TOTAL_FRAMES - 1);
  }

  bindEvents() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    this.handleScroll();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new BrightDiamondScrollApp();
});
