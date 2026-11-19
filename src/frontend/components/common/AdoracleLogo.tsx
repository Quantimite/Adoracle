import React from 'react';

interface AdoracleLogoProps {
    variant?: 'dark' | 'light' | 'emerald';
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function AdoracleLogo({
    variant = 'emerald',
    iconOnly = false,
    size = 'md',
    className = '',
}: AdoracleLogoProps) {
    const dimensions = {
        sm: { icon: 28, text: 'text-xl' },
        md: { icon: 34, text: 'text-2xl' },
        lg: { icon: 44, text: 'text-3xl' },
    }[size];

    const textColor =
        variant === 'dark'
            ? 'text-pureWhite'
            : 'text-slate-900 dark:text-pureWhite';

    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            <svg
                width={dimensions.icon}
                height={dimensions.icon}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                <defs>
                    <linearGradient id="emeraldLeftLeg" x1="10" y1="14" x2="24" y2="54" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4CC8FF" />
                        <stop offset="100%" stopColor="#2AA6F5" />
                    </linearGradient>
                    <linearGradient id="emeraldRightLeg" x1="26" y1="22" x2="43" y2="54" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#1E57D0" />
                    </linearGradient>
                </defs>
                <path
                    d="M27.5 19.5L42.8 50.8C43.7 52.6 42.4 54.6 40.4 54.6H33.1C32.1 54.6 31.1 54 30.7 53.1L22.4 35.2L27.5 19.5Z"
                    fill="url(#emeraldRightLeg)"
                />
                <path
                    d="M24.2 14.2C25.1 12.3 27.8 12.3 28.7 14.2L32.4 21.8L18.2 53.1C17.8 54 16.9 54.6 15.9 54.6H8.6C6.6 54.6 5.3 52.6 6.2 50.8L24.2 14.2Z"
                    fill="url(#emeraldLeftLeg)"
                />
                <path
                    d="M48 7.5C48.4 13.1 50.9 15.6 56.5 16C50.9 16.4 48.4 18.9 48 24.5C47.6 18.9 45.1 16.4 39.5 16C45.1 15.6 47.6 13.1 48 7.5Z"
                    fill="#A5DCFF"
                />
            </svg>

            {!iconOnly && (
                <span className={`${dimensions.text} font-bold tracking-tight transition-colors ${textColor}`}>
                    Adoracle
                </span>
            )}
        </div>
    );
}