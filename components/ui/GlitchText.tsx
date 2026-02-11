import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  text: string;
  className?: string;
}

const GlitchText: React.FC<Props> = ({ text, className = '' }) => {
  return (
    <div className={`relative inline-block ${className}`} style={{ fontFamily: '"Press Start 2P", cursive' }}>
      <motion.span
        animate={{ x: [-1, 1, -1], opacity: [1, 0.8, 1] }}
        transition={{ repeat: Infinity, duration: 0.2, repeatType: 'mirror' }}
        className="absolute top-0 left-0 -ml-[2px] text-red-500 opacity-70 mix-blend-screen"
      >
        {text}
      </motion.span>
      <motion.span
        animate={{ x: [1, -1, 1], opacity: [1, 0.8, 1] }}
        transition={{ repeat: Infinity, duration: 0.3, repeatType: 'mirror' }}
        className="absolute top-0 left-0 ml-[2px] text-blue-500 opacity-70 mix-blend-screen"
      >
        {text}
      </motion.span>
      <span className="relative z-10">{text}</span>
    </div>
  );
};

export default GlitchText;
