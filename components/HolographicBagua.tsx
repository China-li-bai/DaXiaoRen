import React, { useEffect, useRef } from 'react';

interface Props {
  dayMaster: string; // 日主，如 "甲", "乙" 等
  element: string; // 五行属性
  size?: number;
}

const HolographicBagua: React.FC<Props> = ({ dayMaster, element, size = 280 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // 五行颜色映射
  const elementColors: Record<string, { primary: string; secondary: string; glow: string }> = {
    wood: { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.5)' },
    fire: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.5)' },
    earth: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.5)' },
    metal: { primary: '#eab308', secondary: '#ca8a04', glow: 'rgba(234, 179, 8, 0.5)' },
    water: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.5)' },
  };

  const colors = elementColors[element] || elementColors.earth;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotation = 0;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    const drawBagua = () => {
      ctx.clearRect(0, 0, size, size);

      // 外圈发光效果
      const outerGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.2);
      outerGlow.addColorStop(0, colors.glow);
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, size, size);

      // 绘制八卦外圈
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // 外圈圆环
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.stroke();

      // 内圈圆环
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.stroke();

      // 八卦符号
      const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
      const trigramNames = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

      trigrams.forEach((trigram, index) => {
        const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
        const x = Math.cos(angle) * radius * 0.7;
        const y = Math.sin(angle) * radius * 0.7;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-rotation); // 保持文字正向

        // 符号
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = colors.primary;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(trigram, 0, -10);

        // 卦名
        ctx.font = '12px sans-serif';
        ctx.fillStyle = colors.secondary;
        ctx.fillText(trigramNames[index], 0, 15);

        ctx.restore();
      });

      // 中心太极图
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 太极阴阳鱼
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, 0, Math.PI);
      ctx.fillStyle = colors.primary;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, Math.PI, Math.PI * 2);
      ctx.fillStyle = colors.secondary;
      ctx.fill();

      ctx.restore();

      // 中心日主显示
      ctx.save();
      ctx.translate(centerX, centerY);

      // 日主背景光环
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
      glowGradient.addColorStop(0, colors.glow);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 日主文字
      ctx.font = 'bold 48px serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 20;
      ctx.fillText(dayMaster, 0, 0);
      ctx.shadowBlur = 0;

      // 日主标签
      ctx.font = '12px sans-serif';
      ctx.fillStyle = colors.secondary;
      ctx.fillText('日主', 0, 35);

      ctx.restore();

      // 更新旋转角度
      rotation += 0.002;
      animationRef.current = requestAnimationFrame(drawBagua);
    };

    drawBagua();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dayMaster, element, size, colors]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        style={{
          filter: 'drop-shadow(0 0 20px ' + colors.glow + ')',
        }}
      />
      {/* 全息扫描线效果 */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.03) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
};

export default HolographicBagua;
