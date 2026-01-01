import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import ProfileSetup from './ProfileSetup';
import { fetchThemeImage } from '../services/UnsplashService';
import { useGame } from '../context/GameContext';
import LoadingOverlay from './LoadingOverlay';
import ThemeToggle from './ThemeToggle';
import ErrorDialog from './ErrorDialog';
import SpiritAvatar from './SpiritAvatars';

const Layout = ({ children, userProfile }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [bgUrl, setBgUrl] = useState('');
    const { gameState, visualKeyword } = useGame();

    useEffect(() => {
        // Priority: 1. AI Visual Keyword (Event) -> 2. Daily Theme (Friday/Forest) -> 3. User Home Base (Fallback)
        const dailyThemeKeyword = gameState.dayTheme?.split(':')[1]?.trim();
        const term = visualKeyword || dailyThemeKeyword || userProfile?.home_env;

        if (term) {
            fetchThemeImage(term, gameState.toxicity)
                .then(url => setBgUrl(url));
        }
    }, [userProfile?.home_env, visualKeyword, gameState.dayTheme]);

    return (
        <div
            className="min-h-screen text-gray-900 dark:text-white transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${bgUrl})`
            }}
        >
            {/* Dark Mode Overlay Override */}
            <div className="absolute inset-0 bg-black/80 dark:bg-black/80 pointer-events-none -z-10 transition-opacity duration-500 opacity-0 dark:opacity-100" />

            <LoadingOverlay />
            <ErrorDialog />
            <div className="max-w-7xl mx-auto px-4 py-8 relative">
                {/* Header / Nav */}
                <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-glass-black/80 border border-gray-200 dark:border-glass-border rounded-full p-4 px-6 backdrop-blur-xl shadow-xl transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-lg">🌱</span>
                        <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-nana-green to-nana-purple">NANASPROUT</h1>
                    </div>

                    {userProfile && (
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-nana-green-dim dark:text-nana-green">{userProfile.username}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-300">Level {Math.floor((userProfile.xp || 0) / 100) + 1}</div>
                            </div>

                            {/* Profile Interaction */}
                            <button
                                onClick={() => setShowSettings(true)}
                                className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border-2 border-transparent dark:border-white/20 hover:border-nana-green hover:scale-105 transition-all shadow-lg cursor-pointer overflow-hidden"
                            >
                                <SpiritAvatar type={userProfile.avatar_url || 'plant'} className="w-8 h-8" />
                            </button>
                        </div>
                    )}
                </header>

                <main>
                    {children}
                </main>
            </div>

            {/* Profile Editor Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="relative w-full max-w-lg">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute -top-12 right-0 text-white/50 hover:text-white"
                        >
                            <X size={32} />
                        </button>
                        <ProfileSetup onComplete={(updates) => {
                            // Reload page to reflect changes or pass a callback to App to update state
                            setShowSettings(false);
                            window.location.reload();
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
