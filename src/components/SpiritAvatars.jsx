import React from 'react';
import { motion } from 'framer-motion';

// Common wrapper for consistent sizing/positioning
const SpiritWrapper = ({ children, className = "" }) => (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
        {children}
    </div>
);

// 1. Mosskin (Plant) - Bouncy, organic, blinks
export const Mosskin = ({ className }) => (
    <SpiritWrapper className={className}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full scale-150" />

        <motion.svg viewBox="0 0 100 100" className="w-full h-full z-10 drop-shadow-lg"
            animate={{ y: [0, -4, 0], scaleY: [1, 1.02, 1], scaleX: [1, 0.98, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <path d="M20,60 Q10,50 20,40 Q30,10 50,10 Q70,10 80,40 Q90,50 80,60 Q70,90 50,90 Q30,90 20,60 Z" fill="#86cf5b" />

            {/* Eyes */}
            <g transform="translate(0, 5)">
                <motion.ellipse cx="35" cy="45" rx="4" ry="5" fill="#1a2e1a" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 1] }} />
                <motion.ellipse cx="65" cy="45" rx="4" ry="5" fill="#1a2e1a" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 1] }} />
                <ellipse cx="30" cy="55" rx="3" ry="1.5" fill="#ffb7b2" opacity="0.6" />
                <ellipse cx="70" cy="55" rx="3" ry="1.5" fill="#ffb7b2" opacity="0.6" />
            </g>

            {/* Sprout */}
            <motion.path d="M50,10 Q50,0 60,-5 Q65,0 60,5 Q55,5 50,10 Z" fill="#4ade80" stroke="#2f855a" strokeWidth="1"
                style={{ originX: 0.5, originY: 1 }} animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
        </motion.svg>
    </SpiritWrapper>
);

// 2. DewDrop (Water) - Fluid, wobbles, changes shape
export const DewDrop = ({ className }) => (
    <SpiritWrapper className={className}>
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150" />
        <motion.svg viewBox="0 0 100 100" className="w-full h-full z-10 drop-shadow-md"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Wobbling Body */}
            <motion.path fill="#60a5fa" opacity="0.9"
                d="M50,10 C75,10 90,35 90,60 C90,85 75,95 50,95 C25,95 10,85 10,60 C10,35 25,10 50,10 Z"
                animate={{
                    d: [
                        "M50,10 C75,10 90,35 90,60 C90,85 75,95 50,95 C25,95 10,85 10,60 C10,35 25,10 50,10 Z",
                        "M50,5 C80,15 95,40 85,65 C75,90 60,98 50,98 C40,98 25,90 15,65 C5,40 20,15 50,5 Z",
                        "M50,10 C75,10 90,35 90,60 C90,85 75,95 50,95 C25,95 10,85 10,60 C10,35 25,10 50,10 Z"
                    ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Reflection Shine */}
            <ellipse cx="35" cy="30" rx="10" ry="5" fill="white" opacity="0.4" transform="rotate(-45 35 30)" />

            {/* Eyes */}
            <circle cx="40" cy="55" r="4" fill="#1e3a8a" />
            <circle cx="60" cy="55" r="4" fill="#1e3a8a" />
            <path d="M45,60 Q50,65 55,60" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </motion.svg>
    </SpiritWrapper>
);

// 3. EmberSprite (Fire) - Energetic, jumping, crackling
export const EmberSprite = ({ className }) => (
    <SpiritWrapper className={className}>
        <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full scale-150" />
        <motion.svg viewBox="0 0 100 100" className="w-full h-full z-10 drop-shadow-orange"
            animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
        >
            {/* Core Body */}
            <path d="M50,85 Q20,85 20,55 Q20,25 50,15 Q80,25 80,55 Q80,85 50,85 Z" fill="#fb923c" />
            <path d="M50,75 Q30,75 30,55 Q30,35 50,30 Q70,35 70,55 Q70,75 50,75 Z" fill="#fde047" />

            {/* Eyes (Glowing) */}
            <motion.circle cx="40" cy="55" r="3" fill="#fff" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }} />
            <motion.circle cx="60" cy="55" r="3" fill="#fff" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.1 }} />

            {/* Floating Embers */}
            <motion.circle cx="20" cy="40" r="2" fill="#fb923c" animate={{ y: -20, opacity: 0 }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.circle cx="80" cy="30" r="3" fill="#fb923c" animate={{ y: -30, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
        </motion.svg>
    </SpiritWrapper>
);

// 4. Wisp (Wind) - Flowing, gentle, weaving
export const Wisp = ({ className }) => (
    <SpiritWrapper className={className}>
        <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full scale-150" />
        <motion.svg viewBox="0 0 100 100" className="w-full h-full z-10"
            animate={{ x: [-2, 2, -2], y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Sheet/Cloth Body */}
            <motion.path
                d="M50,20 C30,20 20,40 20,60 C20,90 40,80 50,90 C60,80 80,90 80,60 C80,40 70,20 50,20 Z"
                fill="#e0f2fe" opacity="0.8"
                animate={{
                    d: [
                        "M50,20 C30,20 20,40 20,60 C20,90 40,80 50,90 C60,80 80,90 80,60 C80,40 70,20 50,20 Z",
                        "M50,25 C35,25 25,45 25,65 C25,85 45,85 50,95 C55,85 75,85 75,65 C75,45 65,25 50,25 Z",
                        "M50,20 C30,20 20,40 20,60 C20,90 40,80 50,90 C60,80 80,90 80,60 C80,40 70,20 50,20 Z"
                    ]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Hollow Eyes */}
            <circle cx="42" cy="50" r="4" fill="#0ea5e9" opacity="0.5" />
            <circle cx="58" cy="50" r="4" fill="#0ea5e9" opacity="0.5" />
        </motion.svg>
    </SpiritWrapper>
);

// 5. StoneLoam (Earth) - Solid, heavy but alive
export const StoneLoam = ({ className }) => (
    <SpiritWrapper className={className}>
        <div className="absolute inset-0 bg-stone-500/10 blur-xl rounded-full scale-150" />
        <motion.svg viewBox="0 0 100 100" className="w-full h-full z-10"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Main Rock Body */}
            <path d="M30,70 L25,40 L50,25 L75,40 L70,70 L50,85 Z" fill="#78716c" stroke="#57534e" strokeWidth="2" strokeLinejoin="round" />

            {/* Face Plate */}
            <rect x="35" y="45" width="30" height="20" rx="5" fill="#44403c" />

            {/* Glowing Rune Eye */}
            <motion.circle cx="50" cy="55" r="4" fill="#facc15"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Tiny Vine */}
            <path d="M25,40 Q20,30 25,20" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="25" cy="20" r="2" fill="#22c55e" />
        </motion.svg>
    </SpiritWrapper>
);

// [NEW] User Photo Token - Floating image with magical aura
export const UserPhotoAvatar = ({ className, imageUrl }) => (
    <SpiritWrapper className={className}>
        {/* Magical Aura - Pulsing Glow */}
        <motion.div
            className="absolute inset-0 rounded-full bg-nana-green/30 blur-xl scale-110 z-0"
            animate={{ scale: [1.1, 1.3, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Floating Token Container */}
        <motion.div
            className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-nana-green shadow-lg"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <img
                src={imageUrl}
                alt="User Spirit"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onError = null; e.target.src = 'https://ui-avatars.com/api/?name=User&background=random'; }}
            />

            {/* Shine/Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        </motion.div>
    </SpiritWrapper>
);

// Dispatcher Component
export const SpiritAvatar = ({ type, className = "w-16 h-16" }) => {
    // Check if type looks like a URL or is 'custom'
    const isUrl = type && (type.startsWith('http') || type.startsWith('data:'));

    if (isUrl) {
        return <UserPhotoAvatar className={className} imageUrl={type} />;
    }

    switch (type) {
        case 'plant': return <Mosskin className={className} />;
        case 'water': return <DewDrop className={className} />;
        case 'fire': return <EmberSprite className={className} />;
        case 'wind': return <Wisp className={className} />;
        case 'robot': return <StoneLoam className={className} />;
        default: return <Mosskin className={className} />;
    }
};

export default SpiritAvatar;
