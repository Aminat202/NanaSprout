import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Leaderboard from './Leaderboard';

const LeaderboardScreen = ({ onBack }) => {
    const { gameState, themeBackground } = useGame();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-white relative overflow-hidden">

            {/* Background - Sharp image with dark overlay */}
            <div className="absolute inset-0 bg-black z-0">
                {themeBackground && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-70"
                        style={{ backgroundImage: `url(${themeBackground})` }}
                    />
                )}
                {/* Dark gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70"></div>

                {/* Subtle tech grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header with back button */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-4 mb-6"
                >
                    <button
                        onClick={onBack}
                        className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Trophy className="text-nana-green" size={28} />
                        <h1 className="text-2xl font-bold tracking-wider">GLOBAL RANKINGS</h1>
                    </div>
                </motion.div>

                {/* Current Theme indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 text-center"
                >
                    <span className="text-xs text-nana-green tracking-[0.2em] font-mono">
                        CURRENT PROTOCOL: {gameState.dayTheme}
                    </span>
                </motion.div>

                {/* Leaderboard Component */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Leaderboard />
                </motion.div>
            </div>
        </div>
    );
};

export default LeaderboardScreen;
