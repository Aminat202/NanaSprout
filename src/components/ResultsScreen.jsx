import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Skull, Zap, Home, RotateCcw, Medal } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRankData } from '../utils/rankUtils';

const ResultsScreen = ({ results, onViewLeaderboard, onPlayAgain, onGoHome }) => {
    const { gameState, themeBackground } = useGame();

    const survived = results.survived;
    const grade = results.xpGained >= 150 ? 'S' :
        results.xpGained >= 100 ? 'A' :
            results.xpGained >= 50 ? 'B' : 'C';

    const currentLevel = Math.floor((gameState.xp || 0) / 1000) + 1;
    const previousLevel = Math.floor(((gameState.xp || 0) - (results.xpGained || 0)) / 1000) + 1;

    const currentRank = getRankData(currentLevel);
    const previousRank = getRankData(previousLevel);
    const isPromoted = currentRank.name !== previousRank.name;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-white relative">

            {/* Background */}
            <div className="absolute inset-0 bg-black z-0">
                {themeBackground && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-50"
                        style={{ backgroundImage: `url(${themeBackground})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80"></div>
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Main Card */}
                <div className="bg-black/70 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center">

                    {/* Status Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${survived ? 'bg-nana-green/20 border-2 border-nana-green' : 'bg-red-500/20 border-2 border-red-500'
                            }`}
                    >
                        {survived ? (
                            <Trophy size={48} className="text-nana-green" />
                        ) : (
                            <Skull size={48} className="text-red-500" />
                        )}
                    </motion.div>

                    {/* Title */}
                    <h1 className={`text-3xl font-bold mb-1 ${survived ? 'text-nana-green' : 'text-red-400'}`}>
                        {survived ? 'MISSION COMPLETE' : 'SIMULATION FAILED'}
                    </h1>
                    <div className="mb-4">
                        <span className={`text-xs font-black ${currentRank.color} uppercase tracking-[0.2em]`}>
                            Rank: {currentRank.name}
                        </span>
                        {isPromoted && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-yellow-400 font-black text-sm mt-1 animate-pulse"
                            >
                                ★ PROMOTED ★
                            </motion.div>
                        )}
                    </div>
                    <p className="text-gray-400 mb-6 text-xs uppercase tracking-widest">
                        {results.mode === 'classic' ? 'Classic Mode' : 'Survival Mode'} • {results.scenariosCompleted} Scenarios
                    </p>

                    {/* Grade Badge */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-bold ${grade === 'S' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                            grade === 'A' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                                    'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                            }`}>
                            <Medal size={24} />
                            Grade: {grade}
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        <div className="bg-white/5 p-4 rounded-xl">
                            <Heart size={20} className="text-red-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{results.finalHealth}</div>
                            <div className="text-xs text-gray-500">Final HP</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                            <Skull size={20} className="text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{results.finalToxicity}%</div>
                            <div className="text-xs text-gray-500">Toxicity</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                            <Zap size={20} className="text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-yellow-400">+{results.xpGained}</div>
                            <div className="text-xs text-gray-500">XP Earned</div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                    >
                        <button
                            onClick={onViewLeaderboard}
                            className="w-full py-4 bg-nana-green text-black font-bold rounded-xl hover:bg-nana-green/80 transition-all flex items-center justify-center gap-2"
                        >
                            <Trophy size={20} />
                            VIEW RANKINGS
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onPlayAgain}
                                className="py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <RotateCcw size={16} />
                                Play Again
                            </button>
                            <button
                                onClick={onGoHome}
                                className="py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Home size={16} />
                                Home
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResultsScreen;
