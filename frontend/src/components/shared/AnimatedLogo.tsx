import React from 'react';

interface AnimatedLogoProps {
  src: string;
  alt: string;
  shouldAnimate: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  src,
  alt,
  shouldAnimate,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spinSlowDown {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(1800deg); }
            100% { transform: rotate(3600deg); }
          }
        `
      }} />
      <img 
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} ${className}`}
        style={{
          animation: shouldAnimate
            ? 'spinSlowDown 2s cubic-bezier(0.4, 0, 0.2, 1) forwards' 
            : 'none'
        }}
      />
    </>
  );
};

export default AnimatedLogo;