import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useGame } from '../context/GameContext';

const MESSAGES = [
    "Analyzing Bio-Data...",
    "Simulating Consequences...",
    "Querying Nature's Database...",
    "Calibrating Toxicity Levels...",
    "Synthesizing Narrative..."
];

const LoadingOverlay = () => {
    const { isLoading } = useGame();
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setMsgIndex(prev => (prev + 1) % MESSAGES.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);
    //... rest same but remove prop destructuring

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-8 text-nana-green"
                    >
                        <Loader2 size={64} />
                    </motion.div>

                    <motion.div
                        key={msgIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xl font-mono text-nana-green-dim"
                    >
                        {MESSAGES[msgIndex]}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;
