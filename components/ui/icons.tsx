import React from 'react';

interface IconProps {
    className?: string;
}

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z" />
    </svg>
);

export const SkullIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="m15.8 18.5l6 1.6l-.4 1.9l-9.4-2.5L2.6 22l-.5-1.9l6-1.6L2 16.9l.5-1.9l9.4 2.5l9.4-2.5l.5 1.9zM18 8c0 1.8-.8 3.3-2 4.4V15h-2v-2h-1v2h-2v-2h-1v2H8v-2.6C6.8 11.3 6 9.8 6 8a6 6 0 0 1 6-6a6 6 0 0 1 6 6m-7-.5c0-.8-.7-1.5-1.5-1.5S8 6.7 8 7.5S8.7 9 9.5 9S11 8.3 11 7.5m2 3.5l-1-2l-1 2zm3-3.5c0-.8-.7-1.5-1.5-1.5S13 6.7 13 7.5S13.7 9 14.5 9S16 8.3 16 7.5" />
    </svg>
);

export const RocketIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="m13.16 22.19l-1.66-3.84c1.6-.58 3.07-1.35 4.43-2.27l-2.78 6.11m-7.5-9.69l-3.84-1.65l6.11-2.78a20 20 0 0 0-2.27 4.43M21.66 2.35S23.78 7.31 18.11 13c-2.2 2.17-4.58 3.5-6.73 4.34c-.74.28-1.57.1-2.12-.46l-2.13-2.13c-.56-.56-.74-1.38-.47-2.13C7.5 10.5 8.83 8.09 11 5.89C16.69.216 21.66 2.35 21.66 2.35M6.25 22H4.84l4.09-4.1c.3.21.63.36.97.45zM2 22v-1.41l4.77-4.78l1.43 1.42L3.41 22zm0-2.84v-1.41l3.65-3.65c.09.35.24.68.45.97zM16 6a2 2 0 1 0 0 4c1.11 0 2-.89 2-2a2 2 0 0 0-2-2" />
    </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5z" />
    </svg>
);

export const CrosshairIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m-8.95 5H1v-2h2.05C3.5 6.83 6.83 3.5 11 3.05V1h2v2.05c4.17.45 7.5 3.78 7.95 7.95H23v2h-2.05c-.45 4.17-3.78 7.5-7.95 7.95V23h-2v-2.05C6.83 20.5 3.5 17.17 3.05 13M12 5a7 7 0 0 0-7 7a7 7 0 0 0 7 7a7 7 0 0 0 7-7a7 7 0 0 0-7-7" />
    </svg>
);

export const TimerIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="M12 20a7 7 0 0 1-7-7a7 7 0 0 1 7-7a7 7 0 0 1 7 7a7 7 0 0 1-7 7m7.03-12.61l1.42-1.42c-.45-.51-.9-.97-1.41-1.41L17.62 6c-1.55-1.26-3.5-2-5.62-2a9 9 0 0 0-9 9a9 9 0 0 0 9 9c5 0 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61M11 14h2V8h-2m4-7H9v2h6z" />
    </svg>
);

export const FlashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="M18 2c-.9 0-2 1-2 2H8c0-1-1.1-2-2-2H2v9c0 1 1 2 2 2h2.2c.4 2 1.7 3.7 4.8 4v2.08C8 19.54 8 22 8 22h8s0-2.46-3-2.92V17c3.1-.3 4.4-2 4.8-4H20c1 0 2-1 2-2V2zM6 11H4V4h2zm14 0h-2V4h2z" />
    </svg>
);

export const SwordsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="m6.2 2.44l11.9 11.9l2.12-2.12l1.41 1.41l-2.47 2.47l3.18 3.18c.39.39.39 1.02 0 1.41l-.71.71a.996.996 0 0 1-1.41 0L17 18.23l-2.44 2.47l-1.41-1.41l2.12-2.12l-11.9-11.9V2.44zM15.89 10l4.74-4.74V2.44H17.8l-4.74 4.74zm-4.95 5l-2.83-2.87l-2.21 2.21l-2.12-2.12l-1.41 1.41l2.47 2.47l-3.18 3.19a.996.996 0 0 0 0 1.41l.71.71c.39.39 1.02.39 1.41 0L7 18.23l2.44 2.47l1.41-1.41l-2.12-2.12z" />
    </svg>
);
