import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';

const ScenarioCard = ({ scenario, onChoose }) => {
    if (!scenario) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-nana-purple-dim/30 dark:bg-nana-purple-dim/20 border border-nana-purple/30 p-6 rounded-2xl mb-6 backdrop-blur-md"
        >
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-nana-purple/20 rounded-full text-nana-purple">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-nana-purple mb-2">Current Situation</h3>
                    <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium">
                        {scenario.situation}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {scenario.choices?.map((choice, idx) => (
                    <button
                        key={idx}
                        onClick={() => onChoose(choice)}
                        className="text-left p-4 rounded-xl bg-white/40 dark:bg-black/40 border border-white/10 dark:border-white/5 hover:bg-nana-purple hover:text-white dark:hover:bg-nana-green dark:hover:text-black hover:border-transparent transition-all group group-hover:shadow-[0_0_15px_currentColor]"
                    >
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 group-hover:text-white/80 dark:group-hover:text-black/60 uppercase tracking-widest">
                            Option {idx + 1}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-black">
                            {choice}
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default ScenarioCard;
