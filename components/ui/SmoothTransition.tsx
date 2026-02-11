import React, { useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const SmoothTransition: React.FC<Props> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`
        transition-all
        duration-500
        ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default SmoothTransition;