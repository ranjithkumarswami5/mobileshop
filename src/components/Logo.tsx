import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function Logo({ className, showText = true }: { className?: string, showText?: boolean }) {
  const { theme } = useTheme();

  // Use logo4.PNG for dark theme, logo2.PNG for light theme
  // Default to logo2.PNG if theme is not available
  const logoSrc = theme === 'dark' ? '/logo4.PNG' : '/logo2.PNG';

  useEffect(() => {
    console.log('🎨 Logo component - Theme changed to:', theme);
    console.log('🖼️ Logo component - Switching to logo:', logoSrc);
  }, [theme, logoSrc]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
        <img
          key={logoSrc} // Force remount when logo source changes
          src={logoSrc}
          alt="Devi Sri Mobiles Logo"
          className="h-10 w-auto object-contain transition-opacity duration-200"
          onError={(e) => {
            console.error('Logo failed to load:', logoSrc, 'Error:', e);
            // Try fallback to logo.jpeg if PNG fails
            if (e.currentTarget.src.includes('.PNG')) {
              console.log('Trying fallback logo: /logo.jpeg');
              e.currentTarget.src = '/logo.jpeg';
            } else {
              // Hide the image if all fallbacks fail
              e.currentTarget.style.display = 'none';
              console.error('All logo fallbacks failed');
            }
          }}
          onLoad={() => {
            console.log('Logo loaded successfully:', logoSrc);
          }}
        />
      </div>
      {showText && (
        <span className="text-xl font-bold text-primary">
          Devi Sri Mobiles
        </span>
      )}
    </div>
  );
}
