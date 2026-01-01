import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { generateConsequence } from '../services/LLMService';
import { Send, Loader2 } from 'lucide-react';
import ScenarioCard from './ScenarioCard';

const ActionInput = () => {
    const [input, setInput] = useState("");
    const {
        gameState,
        updateStats,
        addLog,
        isLoading,
        setIsLoading,
        setVisualKeyword,
        currentScenario,
        triggerNewScenario
    } = useGame();

    // Trigger initial scenario
    useEffect(() => {
        if (!currentScenario && !isLoading && !gameState.gameOver) {
            triggerNewScenario();
        }
    }, []);

    const processAction = async (actionText) => {
        if (!actionText.trim() || isLoading || gameState.gameOver) return;

        setIsLoading(true);

        // Add player log immediately
        addLog({
            id: Date.now(),
            type: 'player',
            content: actionText,
            timestamp: new Date()
        });

        try {
            // Call AI
            const result = await generateConsequence(actionText, gameState.dayTheme, gameState);

            // Apply results
            updateStats(result.stat_impact);

            // Trigger visual update if keyword exists
            if (result.visual_keyword) {
                setVisualKeyword(result.visual_keyword);
            }

            // Add system log
            addLog({
                id: Date.now() + 1,
                type: 'system',
                content: result.narrative,
                mechanism: result.biological_mechanism,
                status: result.status_effect,
                impact: result.stat_impact,
                timestamp: new Date()
            });

            // Generate NEXT scenario
            await triggerNewScenario();

        } catch (error) {
            console.error("Error processing action:", error);
            addLog({
                id: Date.now() + 1,
                type: 'error',
                content: "The simulation glitched. Try again.",
            });
            setIsLoading(false); // Only set false on error, otherwise triggerNewScenario handles it (sort of context logic overlapping here, triggerNewScenario sets loading true then false)
            // Wait, triggerNewScenario sets loading false at end. So we are good.
            // Actually, triggerNewScenario starts with setIsLoading(true). 
            // If we call it after generateConsequence, there is a micro-gap where loading might be false or true. 
            // Better to just let triggerNewScenario handle the "next phase" loading.
        } finally {
            // In success case, triggerNewScenario will handle SetIsLoading(false) at its end.
            // But we need to ensure we don't double-set or have race conditions.
            // If I put setIsLoading(false) here, it might clash with triggerNewScenario.
            // Let's rely on triggerNewScenario to turn off loading.
            // BUT, if triggerNewScenario isn't called (e.g. error), we must turn it off.
            // Actually, let's keep it simple: We await triggerNewScenario. So we are still "loading" until new scenario is ready.
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await processAction(input);
        setInput("");
    };

    const handleScenarioChoice = async (choice) => {
        await processAction(choice);
    };

    return (
        <div className="mt-8">
            <ScenarioCard
                scenario={currentScenario}
                onChoose={handleScenarioChoice}
            />

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={currentScenario ? "Or type your own creative solution... (e.g., 'I invented a new filter')" : "What did you do today?"}
                    disabled={isLoading || gameState.gameOver}
                    className="w-full min-h-[80px] bg-white/90 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-nana-green transition-all shadow-md dark:shadow-none"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim() || gameState.gameOver}
                    className={`absolute bottom-4 right-4 p-2 rounded-xl transition-all ${isLoading || !input.trim()
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-nana-green text-black hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,157,0.3)]'
                        }`}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
};

export default ActionInput;
