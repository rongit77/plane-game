/**
 * Lightweight particle system for Plane Game. Cap 100 particles.
 */

import React from 'react';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'circle' | 'spark' | 'star';
}

const MAX_PARTICLES = 100;

export type ParticleConfig = {
  count?: number;
  color?: string | string[];
  size?: number | [number, number];
  speed?: number | [number, number];
  life?: number | [number, number];
  type?: Particle['type'];
  spread?: number; // radians for direction spread
};

export class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, count: number, config: ParticleConfig = {}): void {
    const {
      color = '#ff8800',
      size = 4,
      speed = 2,
      life = 0.5,
      type = 'circle',
      spread = Math.PI * 2
    } = config;
    const colors = Array.isArray(color) ? color : [color];
    const sizeRange = Array.isArray(size) ? size : [size * 0.5, size];
    const speedRange = Array.isArray(speed) ? speed : [speed * 0.5, speed];
    const lifeRange = Array.isArray(life) ? life : [life * 0.5, life];
    const space = Math.max(0, MAX_PARTICLES - this.particles.length);
    const n = Math.min(count, Math.max(1, Math.floor(space)));
    for (let i = 0; i < n; i++) {
      const angle = (Math.random() - 0.5) * spread;
      const s = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        life: lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0]),
        maxLife: lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0]),
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        color: colors[Math.floor(Math.random() * colors.length)],
        type
      });
    }
  }

  update(dt: number): void {
    const sec = dt / 1000;
    this.particles = this.particles.filter(p => {
      p.x += p.vx * sec;
      p.y += p.vy * sec;
      p.life -= sec;
      return p.life > 0;
    });
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  /** Return SVG elements for all alive particles (for use in GameCanvas) */
  render(): React.ReactNode {
    return this.particles.map((p, i) => {
      const opacity = p.life / p.maxLife;
      if (p.type === 'star') {
        const r = p.size;
        const points = [0, 1, 2, 3, 4].map(j => {
          const a = (j / 5) * Math.PI * 2 - Math.PI / 2;
          return `${p.x + Math.cos(a) * r},${p.y + Math.sin(a) * r}`;
        }).join(' ');
        return <polygon key={i} points={points} fill={p.color} opacity={opacity} />;
      }
      return (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={p.color}
          opacity={opacity}
        />
      );
    });
  }
}
