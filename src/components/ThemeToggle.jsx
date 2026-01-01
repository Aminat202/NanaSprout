import React from 'react';
import { useGame } from '../context/GameContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useGame();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-3 rounded-full border transition-all ${theme === 'dark'
                    ? 'bg-glass-black border-white/20 text-yellow-400 hover:bg-glass-black/80'
                    : 'bg-white/80 border-gray-200 text-nana-purple shadow-md hover:bg-white'
                }`}
            aria-label="Toggle Dark/Light Mode"
        >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
    );
};

export default ThemeToggle;
