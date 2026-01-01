import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { User, Home, Sparkles, ArrowLeft, Shield, Trophy, Edit2, Save } from 'lucide-react';
import { getRankData } from '../utils/rankUtils';
import SpiritAvatar from './SpiritAvatars';

const AVATARS = [
    { id: 'plant', icon: '🌱', label: 'Mosskin' },
    { id: 'water', icon: '💧', label: 'DewDrop' },
    { id: 'fire', icon: '🔥', label: 'Ember' },
    { id: 'wind', icon: '💨', label: 'Wisp' },
    { id: 'robot', icon: '🤖', label: 'Golem' },
];

const HOMES = [
    { id: 'forest', label: 'Deep Forest', color: 'from-green-900 to-black' },
    { id: 'cyber', label: 'Cyber City', color: 'from-purple-900 to-black' },
    { id: 'desert', label: 'Solar Desert', color: 'from-yellow-900 to-black' },
    { id: 'ocean', label: 'Abyssal Zone', color: 'from-blue-900 to-black' },
    { id: 'space', label: 'Orbital Station', color: 'from-indigo-900 to-black' },
];

const BADGES = [
    { threshold: 0, label: 'Eco Initiate', icon: '🌱' },
    { threshold: 500, label: 'Green Guardian', icon: '🛡️' },
    { threshold: 1500, label: 'Terraformer', icon: '🌍' },
    { threshold: 3000, label: 'Solar Pioneer', icon: '☀️' },
    { threshold: 5000, label: 'Gaia Champion', icon: '👑' },
];

const ProfileSetup = ({ onComplete, onBack, initialProfile }) => {
    // State initialization
    const [isEditing, setIsEditing] = useState(!initialProfile);
    const [username, setUsername] = useState(initialProfile?.username || '');
    const [avatar, setAvatar] = useState(initialProfile?.avatar || initialProfile?.avatar_url || AVATARS[0].id);
    const [home, setHome] = useState(initialProfile?.home_env || HOMES[1].id);
    const [loading, setLoading] = useState(false);

    // Derived stats
    const xp = initialProfile?.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    const levelProgress = ((xp % 1000) / 1000) * 100;
    const earnedBadges = BADGES.filter(b => xp >= b.threshold);
    const nextBadge = BADGES.find(b => xp < b.threshold);
    const rank = getRankData(level);

    const handleSave = async () => {
        if (!username) return;
        setLoading(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getSession().then(({ data }) => data.session ? { data: { user: data.session.user }, error: null } : supabase.auth.signInAnonymously());

            if (authError) throw authError;

            const updates = {
                id: user.id,
                username,
                avatar_url: avatar,
                home_env: home,
                updated_at: new Date()
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (profileError) throw profileError;

            setIsEditing(false);
            if (onComplete) onComplete({ ...initialProfile, ...updates });

        } catch (error) {
            console.error('Error saving profile:', error.message);
            alert('Failed to save profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // View Mode Component
    if (!isEditing && initialProfile) {
        const currentHomeColor = HOMES.find(h => h.id === home)?.color || 'from-gray-900 to-black';

        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-sans">
                <div className={`absolute inset-0 bg-gradient-to-b ${currentHomeColor} opacity-40 transition-colors duration-1000`} />

                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 z-20 p-3 bg-black/40 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-2xl bg-glass-black/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                        {/* Avatar Section */}
                        <div className="flex-shrink-0 relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-nana-green/20 to-nana-purple/20 border-2 border-nana-green flex items-center justify-center shadow-[0_0_30px_rgba(0,255,100,0.3)]">
                                <SpiritAvatar type={avatar} className="w-24 h-24" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-nana-green text-black font-bold px-3 py-1 rounded-full text-sm border border-black">
                                Lvl {level}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`text-xs font-black ${rank.color} uppercase tracking-tighter mb-1`}>{rank.name}</h3>
                                    <h2 className="text-3xl font-bold text-white mb-1">{username}</h2>
                                    <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start gap-2">
                                        <Home size={14} /> {HOMES.find(h => h.id === home)?.label || 'Nomad'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>

                            {/* XP Bar */}
                            <div className="mt-6">
                                <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                    <span>Experience</span>
                                    <span>{xp} / {level * 1000} XP</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelProgress}%` }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-gradient-to-r from-nana-green to-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Badges / Achievements */}
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                                    <Trophy size={16} className="text-yellow-400" />
                                    Achievements
                                </h3>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    {earnedBadges.map((badge, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 group">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:border-yellow-400/50 transition-colors">
                                                {badge.icon}
                                            </div>
                                            <span className="text-[10px] text-gray-500">{badge.label}</span>
                                        </div>
                                    ))}
                                    {nextBadge && (
                                        <div className="flex flex-col items-center gap-1 opacity-50">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 border-dashed flex items-center justify-center text-xl grayscale">
                                                {nextBadge.icon}
                                            </div>
                                            <span className="text-[10px] text-gray-600">Next: {nextBadge.threshold} XP</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Edit Mode
    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${HOMES.find(h => h.id === home).color} opacity-50 transition-colors duration-1000`} />

            {/* Back Button during Edit (if profile exists) */}
            {initialProfile && (
                <button
                    onClick={() => setIsEditing(false)}
                    className="absolute top-6 left-6 z-20 p-3 bg-black/40 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md space-y-8 bg-glass-black border border-glass-border p-8 rounded-3xl backdrop-blur-xl"
            >
                <div>
                    <h2 className="text-3xl font-bold mb-2">
                        {initialProfile ? 'Update Bio-Link' : 'Identify Yourself'}
                    </h2>
                    <p className="text-gray-400">Configure your ranger persona.</p>
                </div>

                {/* Avatar Grid */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2"><User size={16} /> Select Avatar</label>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {AVATARS.map(a => (
                            <button
                                key={a.id}
                                onClick={() => setAvatar(a.id)}
                                className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${avatar === a.id ? 'bg-nana-green/20 border-2 border-nana-green scale-110 shadow-lg shadow-nana-green/20' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                            >
                                <SpiritAvatar type={a.id} className="w-14 h-14" />
                            </button>
                        ))}
                    </div>

                    {/* Custom Photo Input */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Or upload/paste image:</label>
                        <div className="flex gap-2">
                            <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl border border-white/10 transition-colors flex items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setAvatar(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <span className="text-xl">📁</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Paste image URL..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-nana-green"
                                onChange={(e) => {
                                    if (e.target.value.length > 5) setAvatar(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Username Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Codename</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="e.g. NeoSprout"
                        className="w-full bg-black/50 border border-glass-border rounded-xl p-4 text-lg focus:border-nana-green focus:outline-none transition-colors placeholder-gray-600"
                    />
                </div>

                {/* Home Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2"><Home size={16} /> Base Environment</label>
                    <div className="grid grid-cols-2 gap-3">
                        {HOMES.map(h => (
                            <button
                                key={h.id}
                                onClick={() => setHome(h.id)}
                                className={`p-3 rounded-xl text-sm font-medium border transition-all text-left ${home === h.id ? 'border-nana-purple bg-nana-purple/20 text-white' : 'border-glass-border bg-black/20 text-gray-400 hover:bg-white/5'}`}
                            >
                                {h.label}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading || !username}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${username ? 'bg-gradient-to-r from-nana-green to-nana-green-dim text-black shadow-lg shadow-nana-green/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                    {loading ? 'Saving Protocol...' : <><Save size={20} /> SAVE CONFIGURATION</>}
                </motion.button>
            </motion.div>
        </div>
    );
};

export default ProfileSetup;
