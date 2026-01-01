import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Activity, Play, Radio, Users, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRankData } from '../utils/rankUtils';
import SpiritAvatar from './SpiritAvatars';

const MissionHub = ({ userProfile, onStartMission, onGoToSocial, onGoToProfile, onGoToLeaderboard }) => {
    const { gameState, themeBackground } = useGame();

    const level = Math.floor((userProfile?.xp || 0) / 1000) + 1;
    const rank = getRankData(level);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-white relative">

            {/* Background Ambience - Removed white fog/blur */}
            <div className="absolute inset-0 bg-black z-0">
                {themeBackground && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-60"
                        style={{ backgroundImage: `url(${themeBackground})` }}
                    />
                )}
                {/* Dark gradient for text readability, but cleaner than before */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80"></div>

                {/* Tech Grid - made subtler */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[85vh] py-8 lg:h-[85vh]">

                {/* Left Panel: Ranger Status */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="lg:col-span-3 flex flex-col gap-4"
                >
                    <div className="bg-black/60 border border-nana-green/30 p-6 rounded-2xl h-full flex flex-col justify-between backdrop-blur-sm">
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <div className={`w-14 h-14 rounded-full bg-black/40 flex items-center justify-center border ${rank.color.replace('text-', 'border-')} shadow-[0_0_15px_rgba(0,0,0,0.3)] overflow-hidden`}>
                                    <SpiritAvatar type={userProfile?.avatar_url || userProfile?.avatar || 'plant'} className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className={`font-black ${rank.color} tracking-tighter text-xs uppercase`}>{rank.name}</h3>
                                    <p className="text-xl font-light text-white">{userProfile?.username || 'Initiate'}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                                        <span>Bio-Integrity</span>
                                        <span className="text-nana-green">100%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.5 }}
                                            className="h-full bg-nana-green shadow-[0_0_10px_currentColor]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                                        <span>XP Level {Math.floor((userProfile?.xp || 0) / 1000) + 1}</span>
                                        <span className="text-yellow-400">{userProfile?.xp || 0} XP</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((userProfile?.xp || 0) % 1000) / 10}%` }}
                                            transition={{ duration: 1.5, delay: 0.2 }}
                                            className="h-full bg-yellow-400 shadow-[0_0_10px_currentColor]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons added to Left Panel */}
                        <div className="space-y-3">
                            <button
                                onClick={onGoToProfile}
                                className="w-full py-3 px-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-3 font-bold uppercase text-xs tracking-widest"
                            >
                                <Users size={16} />
                                Configure Profile
                            </button>

                            <button
                                onClick={onGoToLeaderboard}
                                className="w-full py-3 px-4 rounded-lg bg-nana-purple/20 border border-nana-purple/50 text-nana-purple-light hover:bg-nana-purple/30 transition-all flex items-center gap-3 font-bold uppercase text-xs tracking-widest"
                            >
                                <Trophy size={16} />
                                Leaderboard
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Center Panel: Holographic Globe & Action */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-6 flex flex-col"
                >
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center backdrop-blur-sm">

                        {/* Central Data Visualization */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-10">
                            {/* Spinning rings */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-nana-green/20 border-dashed"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-8 rounded-full border border-nana-purple/20"
                            />

                            {/* Main Centerpiece */}
                            <div className="text-center z-10 bg-black/50 p-6 rounded-full border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                <p className="text-nana-green text-xs tracking-[0.2em] font-mono mb-2">CURRENT PROTOCOL</p>
                                <h1 className="text-3xl font-bold text-white uppercase max-w-[200px] leading-tight">
                                    {gameState.dayTheme.split(':')[1]}
                                </h1>
                                <p className="text-gray-500 text-xs mt-2">{gameState.dayTheme.split(':')[0]}</p>
                            </div>
                        </div>

                        {/* Initiate Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onStartMission}
                            className="relative px-10 py-5 bg-nana-green/20 border border-nana-green text-nana-green rounded-xl font-bold text-2xl tracking-widest uppercase overflow-hidden transition-all hover:bg-nana-green hover:text-white hover:shadow-[0_0_40px_rgba(0,255,100,0.3)]"
                        >
                            <span className="relative flex items-center gap-4 z-10">
                                <Play size={28} fill="currentColor" />
                                START PATROL
                            </span>
                        </motion.button>

                        <p className="mt-4 text-gray-500 font-mono text-xs">
                            Awaiting manual override...
                        </p>

                    </div>
                </motion.div>

                {/* Right Panel: Environmental Data */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-3 flex flex-col gap-4"
                >
                    <div className="bg-black/60 border border-nana-purple/30 p-6 rounded-2xl h-full flex flex-col backdrop-blur-sm">
                        <h3 className="text-nana-purple font-bold tracking-widest mb-6 flex items-center gap-2 text-sm border-b border-white/10 pb-4">
                            <Activity size={16} />
                            GLOBAL METRICS
                        </h3>

                        <div className="space-y-4 flex-1">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400 text-xs uppercase">Toxicity Level</span>
                                    <Radio size={14} className="text-red-400 animate-pulse" />
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {gameState.toxicity}%
                                </div>
                                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${gameState.toxicity}%` }}></div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400 text-xs uppercase">Theme Output</span>
                                    <Globe size={14} className="text-blue-400" />
                                </div>
                                <div className="text-lg font-bold text-white leading-tight">
                                    {gameState.dayTheme}
                                </div>
                                <div className="text-xs text-blue-400 mt-1">Live Feed Active</div>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                            <div className="text-center font-mono text-[10px] text-gray-600">
                                SERVER: worker-8f7c<br />
                                LATENCY: 24ms
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default MissionHub;
