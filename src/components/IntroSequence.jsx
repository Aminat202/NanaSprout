import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroSequence = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Sequence timer
        const timer1 = setTimeout(() => setStep(1), 1000);
        const timer2 = setTimeout(() => setStep(2), 3500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-transparent flex flex-col items-center justify-center z-50 pointer-events-none">
            {/* Background Overlay if we want it to block everything */}
            <div className="absolute inset-0 bg-black/90 pointer-events-auto" />

            <div className="relative z-10 text-center p-4 sm:p-8 max-w-2xl w-full">
                <AnimatePresence>
                    {step >= 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-nana-green to-nana-purple mb-4 tracking-tighter">
                                NANASPROUT
                            </h1>
                        </motion.div>
                    )}

                    {step >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className="text-xl text-nana-green-dim font-mono mb-8"
                        >
                            Initializing Bio-Monitor Connection...
                        </motion.div>
                    )}

                    {step >= 2 && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onComplete}
                            className="bg-nana-green text-black font-bold py-4 px-12 rounded-full text-xl shadow-lg shadow-nana-green/20 pointer-events-auto"
                        >
                            ENTER SIMULATION
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default IntroSequence;
