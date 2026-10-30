import { useEffect, useRef } from 'react';

const colors = { idle: '#d06470', loading: '#d06470', success: '#69cba1', warning: '#dfb86a', error: '#d6757f' };

export default function DumbbellBackground({ state = 'idle' }) {
  const canvasRef = useRef(null);
  const color = useRef(colors.idle);
  useEffect(() => { color.current = colors[state] || colors.idle; }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let previous = 0;
    let alive = true;
    const pointer = { x: -1000, y: -1000 };

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const oldWidth = width || bounds.width;
      const oldHeight = height || bounds.height;
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!particles.length) {
        const count = width < 600 ? 4 : 7;
        particles = Array.from({ length: count }, (_, index) => {
          const radius = Math.min(width < 600 ? 32 : 38 + index % 3 * 10, width / 6, height / 6);
          const angle = index * 2.4 + .5;
          return {
            x: radius + (width - radius * 2) * ((index * .618 + .1) % 1),
            y: radius + (height - radius * 2) * ((index * .382 + .15) % 1),
            radius, vx: Math.cos(angle) * 38, vy: Math.sin(angle) * 38,
            angle, spin: index % 2 ? .16 : -.13,
          };
        });
      } else {
        for (const item of particles) {
          item.radius = Math.min(item.radius, width / 6, height / 6);
          item.x = Math.max(item.radius, Math.min(width - item.radius, item.x / oldWidth * width));
          item.y = Math.max(item.radius, Math.min(height - item.radius, item.y / oldHeight * height));
        }
      }
      if (reducedMotion.matches) draw();
    }

    function rectangle(x, y, w, h, radius) {
      context.beginPath();
      if (context.roundRect) context.roundRect(x, y, w, h, radius);
      else context.rect(x, y, w, h);
      context.fill();
      context.stroke();
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      for (const item of particles) {
        // Atenuar la zona central para mantener legibles los datos del socio.
        const edge = Math.min(1, Math.abs(item.x - width / 2) / Math.max(1, width * .35));
        context.save();
        context.translate(item.x, item.y);
        context.rotate(item.angle);
        context.globalAlpha = .045 + edge * .16;
        context.fillStyle = color.current;
        context.strokeStyle = color.current;
        context.lineWidth = 1.3;
        const size = item.radius / 1.15;
        rectangle(-size * .7, -size * .085, size * 1.4, size * .17, 3);
        for (const side of [-1, 1]) {
          rectangle(side * size * .64 - size * .13, -size * .58, size * .26, size * 1.16, 4);
          rectangle(side * size * .91 - size * .09, -size * .36, size * .18, size * .72, 3);
        }
        context.restore();
      }
    }

    function update(dt) {
      for (const item of particles) {
        const dx = item.x - pointer.x;
        const dy = item.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < 140) {
          const force = (1 - distance / 140) * 170 * dt;
          item.vx += dx / distance * force;
          item.vy += dy / distance * force;
        }
        const speed = Math.hypot(item.vx, item.vy);
        if (speed > 48) { const damping = Math.exp(-dt * .5); item.vx *= damping; item.vy *= damping; }
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.angle += item.spin * dt;
        if (item.x < item.radius || item.x > width - item.radius) {
          item.x = Math.max(item.radius, Math.min(width - item.radius, item.x));
          item.vx = item.x === item.radius ? Math.abs(item.vx) : -Math.abs(item.vx);
          item.spin *= -1;
        }
        if (item.y < item.radius || item.y > height - item.radius) {
          item.y = Math.max(item.radius, Math.min(height - item.radius, item.y));
          item.vy = item.y === item.radius ? Math.abs(item.vy) : -Math.abs(item.vy);
          item.spin *= -1;
        }
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 1 || distance >= a.radius + b.radius) continue;
          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = (a.radius + b.radius - distance) / 2;
          a.x -= nx * overlap; a.y -= ny * overlap;
          b.x += nx * overlap; b.y += ny * overlap;
          const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (approach < 0) {
            a.vx += approach * nx; a.vy += approach * ny;
            b.vx -= approach * nx; b.vy -= approach * ny;
            a.spin *= -1; b.spin *= -1;
          }
        }
      }
    }

    function tick(time) {
      if (!alive || document.hidden || reducedMotion.matches) return;
      const dt = previous ? Math.min((time - previous) / 1000, .035) : 0;
      previous = time;
      update(dt);
      draw();
      frame = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (reducedMotion.matches) draw();
      else if (!document.hidden) frame = requestAnimationFrame(tick);
    }
    function move(event) {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX; pointer.y = event.clientY;
    }
    function leave() { pointer.x = -1000; pointer.y = -1000; }
    resize();
    restart();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', leave);
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', restart);
    reducedMotion.addEventListener('change', restart);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', leave);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', restart);
      reducedMotion.removeEventListener('change', restart);
    };
  }, []);

  return <canvas ref={canvasRef} className="entry-weights" aria-hidden="true" />;
}
