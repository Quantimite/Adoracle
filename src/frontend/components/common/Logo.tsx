import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showWordmark = true }) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', sparkle: 8 },
    md: { icon: 32, text: 'text-xl', sparkle: 10 },
    lg: { icon: 42, text: 'text-2xl', sparkle: 14 },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric light-blue "A" icon featuring a top-right AI sparkle */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 shadow-lg shadow-sky-500/20"
        style={{ width: icon, height: icon }}
      >
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Geometric A glyph */}
          <path
            d="M20 7L8 33H15L17.8 26.5H25.2L28 33H35L23 7H20Z"
            fill="white"
            fillRule="evenodd"
            clipRule="evenodd"
          />
          <path
            d="M19 21.5L21.5 15.5L24 21.5H19Z"
            fill="#0284C7"
          />
          {/* Top-Right AI Sparkle */}
          <path
            d="M33 3L34.2 7.2L38 8.5L34.2 9.8L33 14L31.8 9.8L28 8.5L31.8 7.2L33 3Z"
            fill="#38BDF8"
            className="animate-pulse"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight text-white ${text} flex items-center gap-1`}>
            Adoracle
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              AI
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

