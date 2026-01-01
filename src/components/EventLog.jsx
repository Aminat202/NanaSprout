import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const EventLog = () => {
    const { history } = useGame();
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    if (history.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic'
            }}>
                The simulation awaits your input...
            </div>
        );
    }

    return (
        <div style={{
            marginTop: '2rem',
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse', // Newest at top? No, usually logs are bottom. Let's stick to standard flow
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[...history].reverse().map((entry) => (
                    <div key={entry.id} style={{
                        background: entry.type === 'player' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
                        padding: '1rem',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${entry.type === 'player' ? '#fff' :
                            entry.impact?.hp < 0 ? 'var(--color-warning)' :
                                entry.impact?.hp > 0 ? 'var(--color-health)' : '#888'
                            }`
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                            {entry.type === 'player' ? 'YOU TOOK ACTION:' : 'CONSEQUENCE:'}
                        </div>
                        <div style={{ lineHeight: 1.4 }}>
                            {entry.content}
                        </div>
                        {entry.mechanism && (
                            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>
                                Biology: {entry.mechanism}
                            </div>
                        )}
                        {entry.status && (
                            <div style={{ marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 'bold' }}>
                                Status: {entry.status}
                            </div>
                        )}
                        {entry.impact && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                                {entry.impact.hp !== 0 && (
                                    <span style={{ color: entry.impact.hp > 0 ? 'var(--color-health)' : 'var(--color-warning)' }}>
                                        {entry.impact.hp > 0 ? '+' : ''}{entry.impact.hp} HP
                                    </span>
                                )}
                                {entry.impact.toxicity !== 0 && (
                                    <span style={{ color: 'var(--color-toxicity)' }}>
                                        {entry.impact.toxicity > 0 ? '+' : ''}{entry.impact.toxicity}% Tox
                                    </span>
                                )}
                                {entry.impact.xp !== 0 && (
                                    <span style={{ color: 'cyan' }}>
                                        +{entry.impact.xp} XP
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default EventLog;
