import React from 'react';

interface JobScoutLogoProps {
  className?: string;
  size?: number | string;
}

export const JobScoutLogo: React.FC<JobScoutLogoProps> = ({ 
  className = "w-7 h-7",
  size
}) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <img 
      src="/jobscout.svg" 
      alt="JobScout Logo" 
      className={`object-contain select-none pointer-events-none inline-block ${className}`}
      style={sizeStyle}
      referrerPolicy="no-referrer"
    />
  );
};

export default JobScoutLogo;
