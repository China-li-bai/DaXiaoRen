import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  lang: 'zh' | 'en';
}

const InteractiveBaguaWheel: React.FC<Props> = ({ value, onChange, min, max, lang }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const yearRange = max - min + 1;
  const anglePerYear = 360 / yearRange;

  const playClickSound = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, []);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartValue(value);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY;
    const yearDelta = Math.round(deltaY / 30);

    let newValue = startValue + yearDelta;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;

    if (newValue !== value) {
      onChange(newValue);
      playClickSound();
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width * 0.4;

    const drawBagua = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const yearAngle = ((value - min) * anglePerYear - 90) * Math.PI / 180;

      ctx.save();
      ctx.translate(centerX, centerY);

      const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
      const trigramNames = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

      trigrams.forEach((trigram, index) => {
        const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
        const x = Math.cos(angle) * radius * 0.7;
        const y = Math.sin(angle) * radius * 0.7;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-yearAngle);

        ctx.font = 'bold 24px "Press Start 2P", cursive';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(trigram, 0, 0);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#FFA500';
        ctx.fillText(trigramNames[index], 0, 20);

        ctx.restore();
      });

      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.25, 0, Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, 0, Math.PI);
      ctx.fillStyle = '#FFA500';
      ctx.fill();

      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);

      const indicatorRadius = radius * 0.95;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(yearAngle) * indicatorRadius,
        Math.sin(yearAngle) * indicatorRadius
      );
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        Math.cos(yearAngle) * indicatorRadius,
        Math.sin(yearAngle) * indicatorRadius,
        8,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#FFD700';
      ctx.fill();

      ctx.restore();
    };

    drawBagua();

    const animationId = requestAnimationFrame(() => {
      drawBagua();
    });

    return () => cancelAnimationFrame(animationId);
  }, [value, min, max, anglePerYear]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    let newValue = value + delta;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
    playClickSound();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 blur-3xl"
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-full cursor-grab active:cursor-grabbing select-none relative z-10"
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onWheel={handleWheel}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))',
          }}
        />

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="bg-black/90 backdrop-blur-sm rounded-xl px-6 py-3 border-2 border-[#FFD700] shadow-2xl">
            <div className="text-center">
              <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-1 font-mono">
                {lang === 'zh' ? '出生年份' : 'BIRTH_YEAR'}
              </p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                {value}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#4A4A4A] text-xs font-mono">
        <span className="text-lg">▲</span>
        <span>{lang === 'zh' ? '滑动或滚动选择' : 'SWIPE OR SCROLL'}</span>
        <span className="text-lg">▼</span>
      </div>
    </div>
  );
};

export default InteractiveBaguaWheel;
