/**
 * Particles drifting along a Perlin-noise flow field, drawn as short trails.
 *
 * Opaque black canvas darkened a little each frame so the trails fade. The
 * pointer stirs the field: particles near it are pushed away, harder the
 * faster the pointer moves.
 */
const count = 700;
const scale = 0.004; // noise sampling step per pixel
const drift = 0.0015; // how fast the field itself evolves per frame

export default {
  name: "flowField",

  setup(p, bg) {
    this.particles = Array.from({ length: count }, () => this.spawn(p));
    this.push = null;
    p.background(0);
  },

  spawn(p) {
    return { x: Math.random() * p.width, y: Math.random() * p.height, vx: 0, vy: 0 };
  },

  draw(p, bg) {
    p.noStroke();
    p.fill(0, 0, 0, 14);
    p.rect(0, 0, p.width, p.height);

    const t = p.frameCount * drift;
    p.stroke(bg.colors.base);
    p.strokeWeight(1.5);
    for (const q of this.particles) {
      const angle = p.noise(q.x * scale, q.y * scale, t) * p.TWO_PI * 2;
      q.vx = q.vx * 0.9 + Math.cos(angle) * 0.6;
      q.vy = q.vy * 0.9 + Math.sin(angle) * 0.6;
      if (this.push) {
        const dx = q.x - this.push.x;
        const dy = q.y - this.push.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < this.push.r2 && d2 > 1) {
          const f = (this.push.k * (1 - d2 / this.push.r2)) / Math.sqrt(d2);
          q.vx += dx * f;
          q.vy += dy * f;
        }
      }
      const nx = q.x + q.vx;
      const ny = q.y + q.vy;
      if (nx < 0 || nx >= p.width || ny < 0 || ny >= p.height) {
        Object.assign(q, this.spawn(p));
        continue;
      }
      if (!bg.inHole(nx, ny) && !bg.inHole(q.x, q.y)) p.line(q.x, q.y, nx, ny);
      q.x = nx;
      q.y = ny;
    }
    p.noStroke();
    if (this.push) {
      this.push.k *= 0.85;
      if (this.push.k < 0.01) this.push = null;
    }

    p.fill(0);
    for (const h of bg.holes) p.rect(h.left, h.top, h.right - h.left, h.bottom - h.top);
  },

  pointer(p, bg, x, y, speed) {
    const k = Math.min(speed / 1.5, 1);
    this.push = { x, y, r2: 120 * 120, k: 0.5 + 3 * k };
  },
};
