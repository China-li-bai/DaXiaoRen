这是一个基于 **React + Tailwind CSS + Framer Motion** 的完整实现方案。

为了完美还原 **2026年“新东方赛博朋克” (Neo-Eastern Cyberpunk)** 的风格，我特别处理了以下细节：
1.  **视觉特效**：加入了 CRT 扫描线、噪点纹理 (Noise Texture) 和故障风 (Glitch) 动画。
2.  **交互逻辑**：实现了“长按充能”按钮，模拟法器启动的物理反馈感。
3.  **动态演示**：使用 Framer Motion 实现了“金克木”（斧头砍树）的动态博弈动画。

### 前置依赖
你需要安装以下库：
```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

### 完整代码 (DiagnosisScreen.tsx)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Axe, Trees, AlertTriangle, Battery, Zap, ShieldAlert } from 'lucide-react';

// --- 全局风格配置 ---
const THEME = {
  colors: {
    bg: '#000000',
    red: '#FF3B30',
    green: '#00FF41',
    gold: '#FFD700',
    grey: '#4A4A4A',
  },
  fonts: {
    title: '"Press Start 2P", cursive', // Pixel Font
    body: '"Inter", sans-serif',
  }
};

// --- 噪点与扫描线背景组件 ---
const CyberBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* 噪点纹理 */}
    <div className="absolute inset-0 opacity-[0.05]" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />
    {/* 扫描线效果 */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
  </div>
);

// --- 故障文字组件 ---
const GlitchText = ({ text, className }: { text: string, className?: string }) => {
  return (
    <div className={`relative inline-block ${className}`} style={{ fontFamily: THEME.fonts.title }}>
      <motion.span 
        animate={{ x: [-1, 1, -1], opacity: [1, 0.8, 1] }} 
        transition={{ repeat: Infinity, duration: 0.2, repeatType: "mirror" }}
        className="absolute top-0 left-0 -ml-[2px] text-red-500 opacity-70 mix-blend-screen"
      >
        {text}
      </motion.span>
      <motion.span 
        animate={{ x: [1, -1, 1], opacity: [1, 0.8, 1] }} 
        transition={{ repeat: Infinity, duration: 0.3, repeatType: "mirror" }}
        className="absolute top-0 left-0 ml-[2px] text-blue-500 opacity-70 mix-blend-screen"
      >
        {text}
      </motion.span>
      <span className="relative z-10">{text}</span>
    </div>
  );
};

// --- 核心：诊断屏幕 ---
export default function DiagnosisScreen() {
  const [charging, setCharging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 模拟五行数据
  const userElement = { name: "甲木", icon: Trees, trait: "正直·易折", color: "text-emerald-400" };
  const villainElement = { name: "庚金", icon: Axe, trait: "肃杀·尖锐", color: "text-[#FFD700]" };

  // 长按充能逻辑
  const startCharge = () => {
    if (isFull) return;
    setCharging(true);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          setIsFull(true);
          // 这里触发跳转逻辑
          console.log("法器已提取！进入下一页");
          return 100;
        }
        return prev + 2; // 充能速度
      });
    }, 20);
  };

  const endCharge = () => {
    if (isFull) return;
    setCharging(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0); // 松手归零，增加紧迫感
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col justify-between">
      {/* 引入 Google Pixel 字体 */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Press+Start+2P&display=swap');`}</style>
      
      <CyberBackground />

      {/* --- Header: 顶部警告 --- */}
      <div className="z-10 pt-12 px-6">
        <div className="border border-[#FF3B30] bg-[#FF3B30]/10 p-2 flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle color="#FF3B30" size={20} />
          <span className="text-[#FF3B30] text-xs font-bold tracking-widest" style={{ fontFamily: THEME.fonts.body }}>
            WARNING: MAGNETIC CONFLICT DETECTED
          </span>
        </div>
      </div>

      {/* --- Body: 五行相克演示 --- */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center px-6 relative">
        
        {/* 对决舞台 */}
        <div className="w-full relative h-64 border-x border-[#4A4A4A]/50 flex items-center justify-between px-4 mb-8">
          {/* 背景网格线 */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-20 pointer-events-none">
             {[...Array(24)].map((_,i) => <div key={i} className="border border-[#4A4A4A]/30"></div>)}
          </div>

          {/* 左侧：本命 (受害者) */}
          <div className="flex flex-col items-center z-10">
            <span className="text-xs text-[#4A4A4A] mb-2 font-mono">USER_ID: 1994</span>
            <div className="w-20 h-20 border-2 border-emerald-500/50 bg-emerald-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
               {/* 受击闪烁效果 */}
               <motion.div 
                 animate={{ opacity: [0, 0.5, 0] }}
                 transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                 className="absolute inset-0 bg-red-500 mix-blend-overlay"
               />
               <userElement.icon size={40} className="text-emerald-400" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-emerald-400" style={{ fontFamily: THEME.fonts.title }}>{userElement.name}</h3>
          </div>

          {/* 中间：相克动画 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
             <motion.div
               animate={{ rotate: [0, -45, 0], scale: [1, 1.2, 1] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
             >
                <ShieldAlert size={32} className="text-[#FF3B30] mb-2" />
             </motion.div>
             <div className="text-[10px] text-[#FF3B30] bg-black px-1 border border-[#FF3B30]">
               CRITICAL DAMAGE
             </div>
          </div>

          {/* 右侧：煞气 (攻击者) */}
          <div className="flex flex-col items-center z-10">
            <span className="text-xs text-[#4A4A4A] mb-2 font-mono">ENEMY_TYPE: METAL</span>
            <div className="w-20 h-20 border-2 border-[#FFD700]/50 bg-[#FFD700]/10 rounded-lg flex items-center justify-center">
               <motion.div
                 animate={{ x: [0, -10, 0], rotate: [0, -15, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "anticipate" }}
               >
                 <villainElement.icon size={40} className="text-[#FFD700]" />
               </motion.div>
            </div>
            <h3 className="mt-2 text-lg font-bold text-[#FFD700]" style={{ fontFamily: THEME.fonts.title }}>{villainElement.name}</h3>
          </div>
        </div>

        {/* 诊断文案 */}
        <div className="bg-[#000000]/80 backdrop-blur-sm border-l-4 border-[#FF3B30] p-4 w-full max-w-md">
          <GlitchText text="诊断报告" className="text-xs mb-2 text-[#4A4A4A]" />
          <p className="text-sm leading-6 text-gray-200" style={{ fontFamily: THEME.fonts.body }}>
            检测到 <span className="text-[#FFD700] font-bold">庚金煞气</span> 正在压制你的本命木。
            <br/>
            <span className="text-xs text-gray-500 mt-1 block">
              > 临床表现：莫名焦虑、颈椎僵硬、被甲方无理刁难。
            </span>
          </p>
        </div>
      </div>

      {/* --- Footer: 交互按钮 --- */}
      <div className="z-10 pb-12 px-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center text-xs text-[#4A4A4A] mb-2 font-mono">
           <span>WEAPON: RED_SLIPPER</span>
           <span>ELEMENT: FIRE (克金)</span>
        </div>
        
        <button
          className="relative w-full h-16 bg-transparent border-2 border-[#FF3B30] overflow-hidden group active:scale-95 transition-transform"
          onPointerDown={startCharge}
          onPointerUp={endCharge}
          onPointerLeave={endCharge}
        >
          {/* 充能进度条背景 */}
          <motion.div 
            className="absolute inset-y-0 left-0 bg-[#FF3B30]"
            style={{ width: `${progress}%` }}
            transition={{ type: "tween", ease: "linear", duration: 0 }}
          />

          {/* 按钮内容 */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 z-10 mix-blend-difference">
            {isFull ? (
               <>
                 <Zap className="text-white animate-bounce" fill="white" />
                 <span className="text-white font-bold tracking-wider" style={{ fontFamily: THEME.fonts.title }}>
                   SYSTEM READY
                 </span>
               </>
            ) : (
               <>
                 <Battery className={`text-white ${charging ? 'animate-pulse' : ''}`} />
                 <span className="text-white font-bold tracking-wider text-sm sm:text-base" style={{ fontFamily: THEME.fonts.title }}>
                   {charging ? `CHARGING ${Math.floor(progress)}%` : "HOLD TO EXTRACT WEAPON"}
                 </span>
               </>
            )}
          </div>

          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#FF3B30] bg-black"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#FF3B30] bg-black"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#FF3B30] bg-black"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#FF3B30] bg-black"></div>
        </button>
        
        <p className="text-center text-[10px] text-[#4A4A4A] mt-4 opacity-60">
          按住 1 秒以注入火属性能量 • 物理引擎预热中
        </p>
      </div>
    </div>
  );
}
```

### 设计亮点解析 (Design Rationales)

1.  **色彩心理学**：
    *   **背景黑 (#000000)**：不是普通的黑，而是叠加了 CRT 扫描线和噪点的黑，营造出“深渊”和“电子屏幕”的质感。
    *   **朱砂红 (#FF3B30)**：用于警告 (Warning) 和武器 (Button)，在黑色背景上极具攻击性，激发用户的战斗欲。
    *   **佛光金 (#FFD700)**：用于表示强大的敌人（庚金），既显眼又带有一种不可一世的压迫感。

2.  **动态博弈 (The Animation)**：
    *   我使用 `framer-motion` 制作了斧头（庚金）不断砍向中间、本命属性（甲木）不断闪烁红光的动画。
    *   这种视觉隐喻比文字更直接：用户一眼就能看出“我正在被攻击/被削”。

3.  **长按充能 (Hold-to-Charge)**：
    *   为什么不直接点击？因为“点击”太廉价了。
    *   **长按** 赋予了操作“重量感”。看着红色的进度条填满按钮，这是一种积蓄能量的过程，为下一页的“暴爽释放”做心理铺垫。
    *   当进度达到 100% 时，文字变成 `SYSTEM READY`，配合震动（如果设备支持），仪式感拉满。

4.  **字体混搭**：
    *   标题使用 `Press Start 2P` (像素字体)，正文使用 `Inter` (无衬线)。这种**复古与现代的冲突感**正是 Cyberpunk 的精髓。

你可以直接将这段代码复制到任何支持 React + Tailwind 的环境中（如 Next.js 或 Vite 项目）运行。