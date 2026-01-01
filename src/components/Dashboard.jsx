import React from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Zap, Skull, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, max, color }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="bg-white/80 dark:bg-glass-black border border-gray-200 dark:border-glass-border p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                    <Icon size={16} className={color} />
                    {label}
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{value}</span>
            </div>

            {/* Progress Bar Background */}
            <div className="h-2 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className={`h-full ${color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`}
                />
            </div>
        </div>
    );
};

const Dashboard = ({ userProfile }) => {
    const { gameState } = useGame();

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                icon={Shield}
                label="Health Integrity"
                value={gameState.health}
                max={100}
                color="text-nana-green"
            />
            <StatCard
                icon={Skull}
                label="Toxicity Level"
                value={gameState.toxicity}
                max={100}
                color="text-nana-purple"
            />
            <StatCard
                icon={Zap}
                label="XP Progress"
                value={gameState.xp}
                max={1000} // Arbitrary level cap
                color="text-yellow-600 dark:text-yellow-400"
            />
            <div className="bg-white/80 dark:bg-glass-black border border-gray-200 dark:border-glass-border p-4 rounded-2xl flex items-center justify-between text-nana-green-dim dark:text-nana-green-dim shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2">
                    <Sun size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Theme</span>
                </div>
                <span className="text-xs uppercase tracking-widest border border-gray-200 dark:border-glass-border px-2 py-1 rounded bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                    {gameState.dayTheme || "System Normal"}
                </span>
            </div>
        </div>
    );
};

export default Dashboard;
