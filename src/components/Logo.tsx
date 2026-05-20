import React from 'react';
import profilePicture from '../assets/profile-picture.png';

interface LogoProps {
  className?: string;
  variant?: 'colorful' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full object-cover rounded-full", variant = 'colorful' }) => {
  return (
    <img 
      src={profilePicture} 
      alt="Puna Tech" 
      className={`${className} border ${variant === 'white' ? 'border-white/20' : 'border-foreground/10'}`} 
    />
  );
};

export default Logo;
