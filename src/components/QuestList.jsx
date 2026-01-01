import React from 'react';
import { useGame } from '../context/GameContext';
import { generateConsequence } from '../services/LLMService';

const QuestList = () => {
    const { gameState, updateStats, addLog, isProcessing } = useGame();

    const quests = [
        { id: 1, title: "Plant a Sapling", desc: "Restore air quality (+HP)", action: "I planted a sapling to restore air quality." },
        { id: 2, title: "Recycle Plastic", desc: "Clear toxicity (-Tox)", action: "I properly recycled plastic waste." },
    ];

    const handleQuest = async (quest) => {
        if (isProcessing) return;

        // Trigger the action similar to manual input
        addLog({
            id: Date.now(),
            type: 'player',
            content: `[QUEST] ${quest.action}`,
            timestamp: new Date()
        });

        try {
            // For quests, we might want guaranteed success in the mock, but let's use the LLM service to keep it consistent
            const result = await generateConsequence(quest.action, gameState.dayTheme);
            updateStats(result.stat_impact);
            addLog({
                id: Date.now() + 1,
                type: 'system',
                content: result.narrative,
                impact: result.stat_impact,
                timestamp: new Date()
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Active Redemption Quests</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {quests.map(q => (
                    <div key={q.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                        onClick={() => handleQuest(q)}
                    >
                        <div style={{ fontWeight: 'bold', color: 'var(--color-health)' }}>{q.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{q.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestList;
