import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion } from 'framer-motion';
import { Crown, Trophy, Medal } from 'lucide-react';
import { getRankName } from '../utils/rankUtils';
import SpiritAvatar from './SpiritAvatars';

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, xp, avatar_url, health')
            .order('xp', { ascending: false })
            .limit(10);

        if (data) setPlayers(data);
        setLoading(false);
    };

    const getIcon = (rank) => {
        if (rank === 0) return <Crown className="text-yellow-400" />;
        if (rank === 1) return <Trophy className="text-gray-300" />;
        if (rank === 2) return <Medal className="text-orange-400" />;
        return <span className="font-mono text-gray-500">#{rank + 1}</span>;
    };

    return (
        <div className="bg-white/80 dark:bg-glass-black border border-gray-200 dark:border-glass-border p-6 rounded-2xl shadow-sm dark:shadow-none">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <Trophy className="text-nana-green" /> Global Rankings
            </h2>

            {loading ? (
                <div className="text-center text-gray-500 animate-pulse">Syncing with Network...</div>
            ) : (
                <div className="space-y-3">
                    {players.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-transparent"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 flex justify-center">{getIcon(i)}</div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                    <SpiritAvatar type={p.avatar_url || 'plant'} className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-gray-900 dark:text-white">{p.username}</div>
                                        <div className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-500 font-bold uppercase tracking-tighter">
                                            {getRankName(Math.floor((p.xp || 0) / 1000) + 1)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{p.health} HP Integrity</div>
                                </div>
                            </div>
                            <div className="text-nana-green-dim dark:text-nana-green font-mono font-bold">
                                {p.xp} XP
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
