import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Skull, Zap, AlertTriangle, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { generateSingleScenario } from '../services/LLMService';

// ============ PREFETCH CONFIG ============
const CONCURRENCY = 2;  // Number of parallel fetches
// =========================================

const GameSession = ({ mode, scenarioLimit, onComplete, onExit }) => {
    const {
        gameState,
        updateStats,
        themeBackground,
        resetGame
    } = useGame();

    const [scenarios, setScenarios] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [sessionStats, setSessionStats] = useState({ hpChange: 0, toxChange: 0, xpGained: 0 });
    const [apiError, setApiError] = useState(null);
    const [fetchingComplete, setFetchingComplete] = useState(false);

    // Refs for prefetch state (don't cause re-renders)
    const fetchedCount = useRef(0);
    const inFlightCount = useRef(0);
    const isMounted = useRef(true);

    // Fetch a single scenario and add to queue
    const fetchNextScenario = useCallback(async () => {
        if (fetchedCount.current >= scenarioLimit) return;
        if (inFlightCount.current >= CONCURRENCY) return;

        const indexToFetch = fetchedCount.current;
        fetchedCount.current++;
        inFlightCount.current++;

        console.log(`[PREFETCH] Starting fetch ${indexToFetch + 1}/${scenarioLimit} (in-flight: ${inFlightCount.current})`);

        try {
            const result = await generateSingleScenario(gameState.dayTheme, indexToFetch);

            if (!isMounted.current) return;

            // Add scenario to queue
            setScenarios(prev => [...prev, result.scenario]);

            // First scenario ready = stop initial loading
            if (indexToFetch === 0) {
                setIsLoading(false);
            }

            console.log(`[PREFETCH] ✓ Scenario ${indexToFetch + 1} added (queue: ${indexToFetch + 1})`);

        } catch (error) {
            console.error(`[PREFETCH] Failed scenario ${indexToFetch + 1}:`, error);
        } finally {
            inFlightCount.current--;

            // Check if all done
            if (fetchedCount.current >= scenarioLimit && inFlightCount.current === 0) {
                console.log("[PREFETCH] All scenarios fetched!");
                setFetchingComplete(true);
            } else {
                // Start next fetch
                fetchNextScenario();
            }
        }
    }, [scenarioLimit, gameState.dayTheme]);

    // Start prefetching on mount
    useEffect(() => {
        resetGame();
        setIsLoading(true);
        isMounted.current = true;

        console.log(`[PREFETCH] Starting with concurrency=${CONCURRENCY}, total=${scenarioLimit}`);

        // Start initial parallel fetches
        for (let i = 0; i < CONCURRENCY; i++) {
            fetchNextScenario();
        }

        return () => {
            isMounted.current = false;
        };
    }, [fetchNextScenario]);

    const handleContinueWithFallback = () => {
        setApiError(null);
    };

    const handleGoBack = () => {
        setApiError(null);
        onExit();
    };

    const currentScenario = scenarios[currentIndex];
    const isWaitingForNextScenario = !isLoading && !fetchingComplete && currentIndex >= scenarios.length;
    const progress = ((currentIndex + (showResult ? 1 : 0)) / scenarioLimit) * 100;

    const handleChoiceSelect = (choice, index) => {
        setSelectedChoice({ ...choice, index });
        setShowResult(true);

        // Apply stats
        updateStats({
            hp: choice.stats.hp,
            toxicity: choice.stats.toxicity,
            xp: choice.stats.xp
        });

        // Track session totals
        setSessionStats(prev => ({
            hpChange: prev.hpChange + choice.stats.hp,
            toxChange: prev.toxChange + choice.stats.toxicity,
            xpGained: prev.xpGained + choice.stats.xp
        }));
    };

    const handleNextScenario = () => {
        if (currentIndex + 1 >= scenarioLimit) {
            // Game complete
            onComplete({
                mode,
                scenariosCompleted: scenarioLimit,
                finalHealth: gameState.health,
                finalToxicity: gameState.toxicity,
                xpGained: sessionStats.xpGained + (selectedChoice?.stats.xp || 0),
                survived: gameState.health > 0
            });
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedChoice(null);
            setShowResult(false);
        }
    };

    // Error dialog
    if (apiError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black z-0">
                    {themeBackground && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url(${themeBackground})` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70"></div>
                </div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 max-w-md w-full mx-4"
                >
                    <div className="bg-black/80 backdrop-blur-md border border-yellow-500/50 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <AlertTriangle size={24} className="text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Connection Issue</h2>
                                <p className="text-gray-400 text-sm">AI service unavailable</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6">{apiError}</p>

                        <div className="space-y-3">
                            <button
                                onClick={handleContinueWithFallback}
                                className="w-full py-3 bg-nana-green text-black font-bold rounded-xl hover:bg-nana-green/80 transition-all"
                            >
                                Continue with Backup Scenarios
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="w-full py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
                            >
                                Go Back to Menu
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black z-0">
                    {themeBackground && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url(${themeBackground})` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70"></div>
                </div>
                <div className="relative z-10 text-center">
                    <Loader2 size={48} className="animate-spin text-nana-green mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Generating Scenarios...</h2>
                    <p className="text-gray-400">Preparing {scenarioLimit} environmental challenges</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white p-4 md:p-8 relative">

            {/* Background */}
            <div className="absolute inset-0 bg-black z-0">
                {themeBackground && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${themeBackground})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70"></div>
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6 relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-nana-green uppercase tracking-wider">
                            {mode === 'classic' ? 'CLASSIC MODE' : 'SURVIVAL MODE'}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Scenario {currentIndex + 1} of {scenarioLimit}
                        </p>
                    </div>
                    <button
                        onClick={onExit}
                        className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-nana-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Stats Bar */}
            <div className="max-w-4xl mx-auto mb-6 relative z-10">
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-3 rounded-xl">
                        <Heart size={18} className="text-red-400" />
                        <span className="text-sm">{gameState.health} HP</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-3 rounded-xl">
                        <Skull size={18} className="text-purple-400" />
                        <span className="text-sm">{gameState.toxicity}% Toxicity</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-3 rounded-xl">
                        <Zap size={18} className="text-yellow-400" />
                        <span className="text-sm">+{sessionStats.xpGained} XP</span>
                    </div>
                </div>
            </div>

            {/* Health Warning */}
            <AnimatePresence>
                {gameState.health <= 20 && gameState.health > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 relative z-10"
                    >
                        <AlertTriangle className="text-red-400" />
                        <span className="text-red-300">Critical health! Choose wisely.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Waiting for next scenario (streaming mode) */}
            {isWaitingForNextScenario && (
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
                    >
                        <Loader2 size={36} className="animate-spin text-nana-green mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Generating next scenario...</h3>
                        <p className="text-gray-400">You're fast! AI is still preparing the next challenge.</p>
                        <div className="mt-4 text-sm text-gray-500">
                            {scenarios.length} of {scenarioLimit} scenarios ready
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Scenario Card */}
            {currentScenario && !isWaitingForNextScenario && (
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        {/* Situation */}
                        <div className="mb-6">
                            <h3 className="text-nana-green font-bold text-sm uppercase tracking-wider mb-2">
                                Current Situation
                            </h3>
                            <p className="text-lg leading-relaxed">
                                {currentScenario.situation}
                            </p>
                        </div>

                        {/* Choices */}
                        <div className="space-y-3 mb-6">
                            {currentScenario.choices.map((choice, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => !showResult && handleChoiceSelect(choice, idx)}
                                    disabled={showResult}
                                    whileHover={!showResult ? { scale: 1.02 } : {}}
                                    whileTap={!showResult ? { scale: 0.98 } : {}}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${showResult
                                        ? selectedChoice?.index === idx
                                            ? choice.isCorrect
                                                ? 'bg-green-500/20 border-green-500'
                                                : 'bg-red-500/20 border-red-500'
                                            : choice.isCorrect
                                                ? 'bg-green-500/10 border-green-500/50'
                                                : 'bg-white/5 border-white/10 opacity-50'
                                        : 'bg-white/5 border-white/10 hover:border-nana-green/50 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-gray-500 text-sm font-mono">
                                            {idx + 1}.
                                        </span>
                                        <div className="flex-1">
                                            <span className={showResult && choice.isCorrect ? 'text-green-400' : ''}>
                                                {choice.text}
                                            </span>
                                            {showResult && selectedChoice?.index === idx && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    {choice.isCorrect ? (
                                                        <CheckCircle size={16} className="text-green-400" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-400" />
                                                    )}
                                                    <span className={`text-xs ${choice.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                        {choice.isCorrect ? 'Correct!' : 'Wrong choice'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Result Panel */}
                        <AnimatePresence>
                            {showResult && selectedChoice && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t border-white/10 pt-6"
                                >
                                    {/* Consequence */}
                                    <div className={`p-4 rounded-xl mb-4 ${selectedChoice.isCorrect
                                        ? 'bg-green-500/10 border border-green-500/30'
                                        : 'bg-red-500/10 border border-red-500/30'
                                        }`}>
                                        <p className="text-lg mb-2">{selectedChoice.consequence}</p>
                                        <div className="flex gap-4 text-sm">
                                            <span className={selectedChoice.stats.hp > 0 ? 'text-green-400' : 'text-red-400'}>
                                                {selectedChoice.stats.hp > 0 ? '+' : ''}{selectedChoice.stats.hp} HP
                                            </span>
                                            <span className={selectedChoice.stats.toxicity < 0 ? 'text-green-400' : 'text-purple-400'}>
                                                {selectedChoice.stats.toxicity > 0 ? '+' : ''}{selectedChoice.stats.toxicity}% Toxicity
                                            </span>
                                            <span className="text-yellow-400">+{selectedChoice.stats.xp} XP</span>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="bg-white/5 p-4 rounded-xl mb-6">
                                        <h4 className="text-nana-green font-bold text-xs uppercase tracking-wider mb-2">
                                            Why?
                                        </h4>
                                        <p className="text-gray-300 text-sm">
                                            {selectedChoice.reason}
                                        </p>
                                    </div>

                                    {/* Next Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNextScenario}
                                        className="w-full py-4 bg-nana-green text-black font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        {currentIndex + 1 >= scenarioLimit ? 'View Results' : 'Next Scenario'}
                                        <ArrowRight size={20} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default GameSession;
