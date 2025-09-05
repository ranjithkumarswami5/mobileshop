import React from 'react';
import { useTheme } from 'next-themes';

export function Logo({ className, showText = true }: { className?: string, showText?: boolean }) {
  const { theme } = useTheme();

  // Use logo4.PNG for dark theme, logo2.PNG for light theme
  const logoSrc = theme === 'dark' ? '/logo4.PNG' : '/logo2.PNG';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="Devi Sri Mobiles Logo"
        className="h-12 w-auto object-contain"
      />
      {showText && (
        <span className="text-xl font-bold text-primary">
          Devi Sri Mobiles
        </span>
      )}
    </div>
  );
}
