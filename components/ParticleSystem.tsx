import React, { useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'paper' | 'star' | 'glow';
  rotation: number;
  rotationSpeed: number;
}

interface Props {
  x: number;
  y: number;
  color?: string;
  count?: number;
  onComplete?: () => void;
}

const ParticleSystem: React.FC<Props> = ({ x, y, color = '#fbbf24', count = 12, onComplete }) => {
  const particlesRef = useRef<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#fbbf24',
      '#ef4444',
      '#ffffff',
      '#f59e0b',
      '#f97316'
    ];

    const types: Array<'spark' | 'paper' | 'star' | 'glow'> = ['spark', 'paper', 'star', 'glow'];

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      const type = types[Math.floor(Math.random() * types.length)];

      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    particlesRef.current = newParticles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = false;

      particlesRef.current.forEach((particle) => {
        if (particle.life <= 0) return;

        activeParticles = true;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.15;
        particle.vx *= 0.99;
        particle.life -= 0.016;
        particle.rotation += particle.rotationSpeed;

        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        switch (particle.type) {
          case 'spark':
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            break;

          case 'paper':
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            break;

          case 'star':
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
              const innerAngle = angle + Math.PI / 5;
              const outerRadius = particle.size;
              const innerRadius = particle.size * 0.4;
              
              if (i === 0) {
                ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
              } else {
                ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
              }
              ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            break;

          case 'glow':
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.5, particle.color + '80');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        ctx.restore();
      });

      if (activeParticles) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y, color, count, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ParticleSystem;
