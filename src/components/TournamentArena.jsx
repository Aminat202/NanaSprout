import React, { useState } from 'react';
import { generateTournamentQuestions } from '../services/LLMService';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

const TournamentArena = ({ onXPGain }) => {
    const { isLoading, setIsLoading } = useGame();
    const [mode, setMode] = useState('menu'); // menu, creating, playing
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);

    const handleCreate = async () => {
        setIsLoading(true);
        const quiz = await generateTournamentQuestions(topic);
        setQuestions(quiz);
        setIsLoading(false);
        setMode('playing');
        setCurrentQ(0);
        setScore(0);
    };

    const handleAnswer = (index) => {
        if (index === questions[currentQ].answer) {
            setScore(prev => prev + 1);
            onXPGain(50); // Instant reward
        }

        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
        } else {
            setMode('finished');
        }
    };

    return (
        <div className="bg-white/80 dark:bg-glass-black border border-gray-200 dark:border-glass-border p-6 rounded-2xl h-full min-h-[400px] shadow-sm dark:shadow-none">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-nana-purple-dim dark:text-nana-purple">
                <Brain /> Knowledge Arena
            </h2>

            <AnimatePresence mode='wait'>
                {mode === 'menu' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">Challenge the system or create your own simulation.</p>
                        <input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter Topic (e.g. Ocean Life)"
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-nana-purple transition-all"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!topic || isLoading}
                            className="w-full py-4 bg-nana-purple text-white font-bold rounded-xl hover:bg-nana-purple-dim transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles />
                            {isLoading ? "Generating Quiz..." : "Create Tournament"}
                        </button>
                    </motion.div>
                )}

                {mode === 'playing' && questions.length > 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} key={currentQ}>
                        <div className="mb-4 flex justify-between text-sm text-gray-400">
                            <span>Question {currentQ + 1}/{questions.length}</span>
                            <span>Score: {score}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-6">{questions[currentQ].q}</h3>
                        <div className="grid gap-3">
                            {questions[currentQ].options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    className="p-4 text-left rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-nana-purple transition-all"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {mode === 'finished' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-2xl font-bold mb-2">Tournament Complete!</h3>
                        <p className="text-gray-400 mb-6">You scored {score} / {questions.length}</p>
                        <button
                            onClick={() => setMode('menu')}
                            className="px-8 py-3 bg-white/10 rounded-full hover:bg-white/20"
                        >
                            Return to Arena
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TournamentArena;
