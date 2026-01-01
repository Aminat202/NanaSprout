import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Brain, Clock, Target } from 'lucide-react';
import { useGame } from '../context/GameContext';

const ModeSelection = ({ onSelectMode, onBack }) => {
    const { gameState, themeBackground } = useGame();

    const modes = [
        {
            id: 'classic',
            name: 'CLASSIC',
            subtitle: 'Quick Session',
            scenarios: 3,
            icon: Clock,
            color: 'nana-green',
            description: 'Perfect for a quick eco-challenge. Face 3 scenarios and test your choices.'
        },
        {
            id: 'survival',
            name: 'SURVIVAL',
            subtitle: 'Full Challenge',
            scenarios: 10,
            icon: Shield,
            color: 'yellow-400',
            description: 'The ultimate test. Navigate 10 environmental scenarios to prove your worth.'
        },
        {
            id: 'social',
            name: 'SOCIAL ARENA',
            subtitle: 'Knowledge Battle',
            scenarios: 0, // Quiz-based
            icon: Brain,
            color: 'nana-purple',
            description: 'Challenge the community with AI-generated quizzes on environmental topics.'
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-white relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 bg-black z-0">
                {themeBackground && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-60"
                        style={{ backgroundImage: `url(${themeBackground})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <button
                        onClick={onBack}
                        className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-wider">SELECT MODE</h1>
                        <p className="text-gray-400 text-sm">Choose your challenge level</p>
                    </div>
                </motion.div>

                {/* Current Theme */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-8 text-center"
                >
                    <span className="text-xs text-nana-green tracking-[0.2em] font-mono px-4 py-2 bg-nana-green/10 border border-nana-green/30 rounded-full">
                        TODAY'S THEME: {gameState.dayTheme}
                    </span>
                </motion.div>

                {/* Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modes.map((mode, index) => (
                        <motion.button
                            key={mode.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectMode(mode.id, mode.scenarios)}
                            className={`text-left p-6 rounded-2xl bg-black/60 border border-${mode.color}/30 hover:border-${mode.color}/60 transition-all group backdrop-blur-sm`}
                        >
                            <div className={`w-14 h-14 rounded-xl bg-${mode.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <mode.icon size={28} className={`text-${mode.color}`} />
                            </div>

                            <h2 className="text-xl font-bold mb-1">{mode.name}</h2>
                            <p className={`text-${mode.color} text-sm font-medium mb-3`}>{mode.subtitle}</p>

                            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                                {mode.description}
                            </p>

                            {mode.scenarios > 0 && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Target size={14} />
                                    <span>{mode.scenarios} Scenarios</span>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModeSelection;
