import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateDailyScenario } from '../services/LLMService';
import { fetchThemeImage } from '../services/UnsplashService';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const getDailyTheme = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const themes = [
    "Community: Public Spaces", // Sunday
    "Kitchen: Food Waste",      // Monday
    "Transport: Emission Control", // Tuesday
    "Office: Digital Waste",    // Wednesday
    "Home: Energy Conservation", // Thursday
    "Environment: Local Wildlife", // Friday
    "Self: Personal Detox"       // Saturday
  ];
  const dayIndex = new Date().getDay();
  return `${days[dayIndex]}: ${themes[dayIndex]}`;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    health: 100,
    toxicity: 0,
    xp: 0,
    level: 1,
    dayTheme: getDailyTheme(),
    gameOver: false,
  });

  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for game over conditions
  useEffect(() => {
    if (gameState.health <= 0) {
      setGameState(prev => ({ ...prev, health: 0, gameOver: true }));
      // Could add a toast or modal trigger here
    }
  }, [gameState.health]);

  const [lastEffect, setLastEffect] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visualKeyword, setVisualKeyword] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [uiError, setUiError] = useState(null);
  const [themeBackground, setThemeBackground] = useState(null);

  // Ensure dayTheme is always today's theme (recalculate on mount)
  useEffect(() => {
    const todayTheme = getDailyTheme();
    if (gameState.dayTheme !== todayTheme) {
      console.log('[GameContext] Theme changed from', gameState.dayTheme, 'to', todayTheme);
      setGameState(prev => ({ ...prev, dayTheme: todayTheme }));
    }
  }, []); // Run once on mount

  // Load theme background (depends on dayTheme)
  useEffect(() => {
    const loadBackground = async () => {
      // dayTheme format: "Sunday: Community: Public Spaces"
      // Extract the MAIN theme (Community, Kitchen, Transport, etc.)
      const parts = gameState.dayTheme.split(':');
      const mainTheme = parts[1]?.trim() || 'nature';  // "Community"
      console.log('[GameContext] Loading background for:', mainTheme);
      const url = await fetchThemeImage(mainTheme);
      setThemeBackground(url);
    };
    loadBackground();
  }, [gameState.dayTheme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const clearError = () => setUiError(null);

  const triggerNewScenario = async () => {
    setIsLoading(true);
    const scenario = await generateDailyScenario(gameState.dayTheme, gameState.toxicity);

    if (scenario.error) {
      setUiError(`AI Connection Unstable: ${scenario.error}. Switched to Backup Protocols.`);
    }

    setCurrentScenario(scenario);
    setIsLoading(false);
  };

  const updateStats = (impact = {}) => {
    setGameState(prev => {
      let newHealth = Math.min(Math.max(prev.health + (impact.hp || 0), 0), 100);
      let newToxicity = Math.min(Math.max(prev.toxicity + (impact.toxicity || 0), 0), 100);
      let newXp = prev.xp + (impact.xp || 0);

      // Clamp values
      // The Math.min/Math.max already handles clamping, so these are redundant if using the new clamping logic.
      // if (newHealth > 100) newHealth = 100;
      // if (newToxicity < 0) newToxicity = 0;
      // if (newToxicity > 100) newToxicity = 100; // Maybe 100 toxicity = death too?

      return {
        ...prev,
        health: newHealth,
        toxicity: newToxicity,
        xp: newXp
      };
    });

    // Trigger visual effects
    if (impact.hp < 0) setLastEffect({ type: 'damage', id: Date.now() });
    else if (impact.hp > 0) setLastEffect({ type: 'heal', id: Date.now() });
  };

  const addLog = (entry) => {
    setHistory(prev => [entry, ...prev]);
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      health: 100,
      toxicity: 0,
      gameOver: false
    }));
    setHistory([]);
    setCurrentScenario(null);
  };

  const value = {
    gameState,
    history,
    updateStats,
    addLog,
    isProcessing,
    setIsProcessing,
    setGameState,
    lastEffect,
    isLoading,
    setIsLoading,
    visualKeyword,
    setVisualKeyword,
    theme,
    toggleTheme,
    currentScenario,
    setCurrentScenario,
    triggerNewScenario,
    uiError,
    setUiError,
    clearError,
    resetGame,
    themeBackground
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
