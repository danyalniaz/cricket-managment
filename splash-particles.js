/* ============================================================
   CRICSCORER PRO — CANVAS PARTICLE ENGINE (splash-particles.js)
   Sparks, light streaks, and stadium-light dust particles
   ============================================================ */

(function() {
  function initSplashCanvas() {
    const canvas = document.getElementById('splash-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let animId;
    let particles = [];
    let streaks   = [];
    let ticks     = 0;

    window.addEventListener('resize', () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    // ---- Particle class ----
    class Particle {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type || 'spark';
        this.life  = 1;
        this.decay = Math.random() * 0.015 + 0.008;

        if (this.type === 'spark') {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed - 3;
          this.gravity = 0.15;
          this.size  = Math.random() * 3 + 1;
          const hue  = Math.random() > 0.5 ? 155 : 210; // green or blue
          this.color = `hsl(${hue}, 90%, 65%)`;
        } else if (this.type === 'dust') {
          this.vx = (Math.random() - 0.5) * 0.6;
          this.vy = -Math.random() * 0.8 - 0.2;
          this.gravity = 0;
          this.size  = Math.random() * 2 + 0.5;
          this.color = `rgba(255,255,255,${Math.random() * 0.3 + 0.05})`;
          this.decay = Math.random() * 0.006 + 0.003;
        } else if (this.type === 'ember') {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
          const speed = Math.random() * 8 + 4;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.gravity = 0.25;
          this.size  = Math.random() * 4 + 1;
          const palette = ['#10b981','#3b82f6','#f59e0b','#ffffff','#fbbf24'];
          this.color = palette[Math.floor(Math.random() * palette.length)];
          this.decay = Math.random() * 0.02 + 0.01;
        }
      }

      update() {
        this.x  += this.vx;
        this.vy += this.gravity;
        this.y  += this.vy;
        this.life -= this.decay;
        if (this.type === 'spark' || this.type === 'ember') {
          this.vx *= 0.97;
        }
      }

      draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        if (this.type === 'dust') {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Glowing spark
          ctx.shadowBlur  = 12;
          ctx.shadowColor = this.color;
          ctx.fillStyle   = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      isDead() { return this.life <= 0; }
    }

    // ---- Light streak class ----
    class Streak {
      constructor() {
        this.reset();
      }
      reset() {
        this.x     = Math.random() * W * 0.5;
        this.y     = Math.random() * H * 0.5;
        this.angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        this.speed = Math.random() * 18 + 10;
        this.len   = Math.random() * 180 + 60;
        this.life  = 1;
        this.decay = Math.random() * 0.06 + 0.04;
        const hue  = Math.random() > 0.6 ? 155 : 210;
        this.color = `hsl(${hue}, 90%, 70%)`;
      }
      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= this.decay;
        if (this.isDead()) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life * 0.5);
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = 1.5;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len
        );
        ctx.stroke();
        ctx.restore();
      }
      isDead() { return this.life <= 0; }
    }

    // Init streaks (always running)
    for (let i = 0; i < 8; i++) {
      const s = new Streak();
      s.life = Math.random(); // stagger start
      streaks.push(s);
    }

    // ---- Big burst at bat-impact moment (t ≈ 1.1s) ----
    function bigBurst() {
      const cx = W * 0.58;
      const cy = H * 0.42;
      for (let i = 0; i < 120; i++) {
        particles.push(new Particle(cx, cy, 'ember'));
      }
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(
          cx + (Math.random() - 0.5) * 80,
          cy + (Math.random() - 0.5) * 80,
          'spark'
        ));
      }
    }

    // Continuous ambient dust
    function spawnDust() {
      const x = Math.random() * W;
      const y = H * 0.6 + Math.random() * H * 0.4;
      particles.push(new Particle(x, y, 'dust'));
    }

    // ---- Animation loop ----
    function loop() {
      ctx.clearRect(0, 0, W, H);

      ticks++;

      // Trigger big burst at frame ~66 (≈1.1s at 60fps)
      if (ticks === 66) bigBurst();

      // Spawn continuous dust
      if (ticks % 4 === 0) spawnDust();

      // Spawn occasional sparks after burst
      if (ticks > 66 && ticks % 8 === 0) {
        const cx = W * 0.58;
        const cy = H * 0.42;
        particles.push(new Particle(cx + (Math.random()-0.5)*100, cy + (Math.random()-0.5)*100, 'spark'));
      }

      // Draw & update streaks
      streaks.forEach(s => { s.update(); s.draw(); });

      // Draw & update particles
      particles = particles.filter(p => { p.update(); p.draw(); return !p.isDead(); });

      animId = requestAnimationFrame(loop);
    }

    loop();

    // Stop canvas when splash closes
    window.stopSplashCanvas = function() {
      cancelAnimationFrame(animId);
    };
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplashCanvas);
  } else {
    initSplashCanvas();
  }
})();
