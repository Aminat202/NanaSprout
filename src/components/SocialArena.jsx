import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Play, Clock, Trophy, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { createChallenge, getChallenges, incrementPlays, getTimeRemaining } from '../services/ChallengeService';

const SocialArena = ({ onExit }) => {
    const { gameState, updateStats } = useGame();

    // Main state
    const [mode, setMode] = useState('browse'); // browse, create, play, finished
    const [challenges, setChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create mode state
    const [creatorName, setCreatorName] = useState('');
    const [title, setTitle] = useState('');
    const [scenarios, setScenarios] = useState([
        {
            situation: '', choices: [
                { text: '', xp: 30, isCorrect: true },
                { text: '', xp: 5, isCorrect: false },
                { text: '', xp: 0, isCorrect: false }
            ]
        },
        {
            situation: '', choices: [
                { text: '', xp: 30, isCorrect: true },
                { text: '', xp: 5, isCorrect: false },
                { text: '', xp: 0, isCorrect: false }
            ]
        },
        {
            situation: '', choices: [
                { text: '', xp: 30, isCorrect: true },
                { text: '', xp: 5, isCorrect: false },
                { text: '', xp: 0, isCorrect: false }
            ]
        }
    ]);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

    // Play mode state
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);
    const [playIndex, setPlayIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [totalXP, setTotalXP] = useState(0);

    // Shuffle array utility (Fisher-Yates)
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Load challenges on mount
    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        setIsLoading(true);
        const { data, error } = await getChallenges();
        if (error) {
            setError(error);
        } else {
            setChallenges(data);
        }
        setIsLoading(false);
    };

    // Handle scenario input changes
    const updateScenario = (scenarioIdx, field, value) => {
        setScenarios(prev => {
            const updated = [...prev];
            updated[scenarioIdx] = { ...updated[scenarioIdx], [field]: value };
            return updated;
        });
    };

    const updateChoice = (scenarioIdx, choiceIdx, field, value) => {
        setScenarios(prev => {
            const updated = [...prev];
            const choices = [...updated[scenarioIdx].choices];
            choices[choiceIdx] = { ...choices[choiceIdx], [field]: value };

            // If marking as correct, unmark others
            if (field === 'isCorrect' && value === true) {
                choices.forEach((c, i) => {
                    if (i !== choiceIdx) c.isCorrect = false;
                });
            }

            updated[scenarioIdx] = { ...updated[scenarioIdx], choices };
            return updated;
        });
    };

    // Submit challenge
    const handleSubmitChallenge = async () => {
        // Validate
        if (!creatorName.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }

        for (let i = 0; i < scenarios.length; i++) {
            if (!scenarios[i].situation.trim()) {
                setError(`Scenario ${i + 1} needs a situation`);
                return;
            }
            const hasCorrect = scenarios[i].choices.some(c => c.isCorrect);
            if (!hasCorrect) {
                setError(`Scenario ${i + 1} needs a correct answer`);
                return;
            }
            for (let j = 0; j < scenarios[i].choices.length; j++) {
                if (!scenarios[i].choices[j].text.trim()) {
                    setError(`Scenario ${i + 1}, Choice ${j + 1} needs text`);
                    return;
                }
            }
        }

        setIsLoading(true);
        setError(null);

        const { data, error } = await createChallenge(creatorName.trim(), title, scenarios);

        if (error) {
            setError(error);
            setIsLoading(false);
            return;
        }

        // Reset and go back to browse
        setCreatorName('');
        setTitle('');
        setScenarios([
            { situation: '', choices: [{ text: '', xp: 30, isCorrect: true }, { text: '', xp: 5, isCorrect: false }, { text: '', xp: 0, isCorrect: false }] },
            { situation: '', choices: [{ text: '', xp: 30, isCorrect: true }, { text: '', xp: 5, isCorrect: false }, { text: '', xp: 0, isCorrect: false }] },
            { situation: '', choices: [{ text: '', xp: 30, isCorrect: true }, { text: '', xp: 5, isCorrect: false }, { text: '', xp: 0, isCorrect: false }] }
        ]);
        setCurrentScenarioIndex(0);
        await loadChallenges();
        setMode('browse');
        setIsLoading(false);
    };

    // Start playing a challenge - shuffle choices for each scenario
    const startChallenge = async (challenge) => {
        // Shuffle choices in each scenario to prevent pattern cheating
        const shuffled = challenge.scenarios.map(scenario => ({
            ...scenario,
            choices: shuffleArray(scenario.choices)
        }));
        setShuffledScenarios(shuffled);
        setSelectedChallenge(challenge);
        setPlayIndex(0);
        setScore(0);
        setTotalXP(0);
        await incrementPlays(challenge.id);
        setMode('play');
    };

    // Handle choice in play mode
    const handlePlayChoice = (choice) => {
        if (choice.isCorrect) {
            setScore(prev => prev + 1);
        }
        setTotalXP(prev => prev + (choice.xp || 0));

        if (playIndex < selectedChallenge.scenarios.length - 1) {
            setPlayIndex(prev => prev + 1);
        } else {
            // Finished - award XP
            updateStats({ xp: totalXP + (choice.xp || 0) });
            setMode('finished');
        }
    };

    // Render based on mode
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onExit}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-yellow-400" />
                    Social Arena
                </h1>
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-xl mb-4">
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* BROWSE MODE */}
                {mode === 'browse' && (
                    <motion.div
                        key="browse"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Create button */}
                        <button
                            onClick={() => setMode('create')}
                            className="w-full mb-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
                        >
                            <Plus /> Create Challenge
                        </button>

                        {/* Challenges list */}
                        <h2 className="text-lg font-semibold mb-4 text-gray-400">Community Challenges</h2>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : challenges.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No challenges yet. Be the first to create one!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {challenges.map((challenge) => (
                                    <div
                                        key={challenge.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg">{challenge.title}</h3>
                                                <p className="text-sm text-gray-400">by {challenge.creator_name}</p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <Play size={14} /> {challenge.plays_count} plays
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Clock size={14} /> {getTimeRemaining(challenge.expires_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => startChallenge(challenge)}
                                            className="w-full mt-2 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center justify-center gap-2"
                                        >
                                            <Play size={18} /> Play Challenge
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* CREATE MODE */}
                {mode === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setMode('browse')}
                            className="text-gray-400 flex items-center gap-2 hover:text-white"
                        >
                            <ArrowLeft size={18} /> Back to challenges
                        </button>

                        <h2 className="text-xl font-bold">Create Your Challenge</h2>

                        {/* Creator Name */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                            <input
                                value={creatorName}
                                onChange={(e) => setCreatorName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 outline-none"
                            />
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Challenge Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Ocean Rescue Mission"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 outline-none"
                            />
                        </div>

                        {/* Scenario tabs */}
                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentScenarioIndex(i)}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${currentScenarioIndex === i
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    Scenario {i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Current scenario form */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Situation</label>
                                <textarea
                                    value={scenarios[currentScenarioIndex].situation}
                                    onChange={(e) => updateScenario(currentScenarioIndex, 'situation', e.target.value)}
                                    placeholder="Describe the environmental situation..."
                                    rows={3}
                                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:border-purple-500 outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm text-gray-400">Choices (mark one as correct)</label>
                                {scenarios[currentScenarioIndex].choices.map((choice, choiceIdx) => (
                                    <div key={choiceIdx} className="flex gap-2 items-center">
                                        <button
                                            onClick={() => updateChoice(currentScenarioIndex, choiceIdx, 'isCorrect', true)}
                                            className={`p-2 rounded-lg ${choice.isCorrect
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white/10 text-gray-400'
                                                }`}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <input
                                            value={choice.text}
                                            onChange={(e) => updateChoice(currentScenarioIndex, choiceIdx, 'text', e.target.value)}
                                            placeholder={`Choice ${choiceIdx + 1}`}
                                            className="flex-1 p-2 bg-black/30 border border-white/10 rounded-lg focus:border-purple-500 outline-none"
                                        />
                                        <input
                                            type="number"
                                            value={choice.xp}
                                            onChange={(e) => updateChoice(currentScenarioIndex, choiceIdx, 'xp', parseInt(e.target.value) || 0)}
                                            className="w-16 p-2 bg-black/30 border border-white/10 rounded-lg text-center"
                                            placeholder="XP"
                                        />
                                        <span className="text-xs text-gray-500">XP</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmitChallenge}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-lg disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Publish Challenge'}
                        </button>
                    </motion.div>
                )}

                {/* PLAY MODE */}
                {mode === 'play' && selectedChallenge && (
                    <motion.div
                        key="play"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* Progress bar */}
                        <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                            <span>{selectedChallenge.title}</span>
                            <span>{playIndex + 1} / {selectedChallenge.scenarios.length}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600 transition-all"
                                style={{ width: `${((playIndex + 1) / selectedChallenge.scenarios.length) * 100}%` }}
                            />
                        </div>

                        {/* Scenario */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <p className="text-lg font-medium mb-6">
                                {shuffledScenarios[playIndex]?.situation}
                            </p>

                            <div className="space-y-3">
                                {shuffledScenarios[playIndex]?.choices.map((choice, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handlePlayChoice(choice)}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-purple-500 transition-all"
                                    >
                                        <span>{choice.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Current score */}
                        <div className="flex justify-center gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-green-400">{score}</div>
                                <div className="text-xs text-gray-500">Correct</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-400">{totalXP}</div>
                                <div className="text-xs text-gray-500">XP Earned</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FINISHED MODE */}
                {mode === 'finished' && (
                    <motion.div
                        key="finished"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-10"
                    >
                        <Trophy size={64} className="mx-auto mb-4 text-yellow-400" />
                        <h2 className="text-3xl font-bold mb-2">Challenge Complete!</h2>
                        <p className="text-gray-400 mb-6">
                            You scored {score} / {selectedChallenge?.scenarios.length}
                        </p>
                        <div className="text-4xl font-bold text-yellow-400 mb-8">
                            +{totalXP} XP
                        </div>
                        <button
                            onClick={() => {
                                setMode('browse');
                                setSelectedChallenge(null);
                            }}
                            className="px-8 py-3 bg-white/10 rounded-full hover:bg-white/20 font-bold"
                        >
                            Back to Arena
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialArena;
