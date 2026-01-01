import React, { useState, useEffect } from "react";
import { GameProvider } from "./context/GameContext";
import IntroSequence from "./components/IntroSequence";
import ProfileSetup from "./components/ProfileSetup";
import MissionHub from "./components/MissionHub";
import ModeSelection from "./components/ModeSelection";
import GameSession from "./components/GameSession";
import ResultsScreen from "./components/ResultsScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import TournamentArena from "./components/TournamentArena";
import SocialArena from "./components/SocialArena";
import Layout from "./components/Layout";
import { supabase } from "./services/supabaseClient";

function App() {
  // Phases: intro, setup, hub, modeSelect, gameplay, social, results, leaderboard
  const [phase, setPhase] = useState("intro");
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Game mode state
  const [gameMode, setGameMode] = useState(null); // 'classic', 'survival', 'social'
  const [scenarioLimit, setScenarioLimit] = useState(3);
  const [gameResults, setGameResults] = useState(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              setUserProfile(data);
              setPhase("hub");
            } else {
              setPhase("setup");
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setPhase("intro");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleIntroComplete = () => {
    if (session && userProfile) {
      setPhase("hub");
    } else {
      setPhase("setup");
    }
  };

  const handleProfileComplete = (profileData) => {
    setUserProfile(profileData);
    setPhase("hub");
  };

  const handleSelectMode = (mode, scenarios) => {
    setGameMode(mode);
    setScenarioLimit(scenarios);
    if (mode === 'social') {
      setPhase("social");
    } else {
      setPhase("gameplay");
    }
  };

  const handleGameComplete = async (results) => {
    setGameResults(results);

    // Update XP in database
    if (userProfile && results.xpGained > 0) {
      await supabase.from('profiles').update({
        xp: (userProfile.xp || 0) + results.xpGained
      }).eq('id', userProfile.id);

      // Refresh profile
      const { data } = await supabase.from('profiles').select('*').eq('id', userProfile.id).single();
      if (data) setUserProfile(data);
    }

    setPhase("results");
  };

  const handlePlayAgain = () => {
    setPhase("modeSelect");
  };

  return (
    <GameProvider>
      {phase === "intro" && <IntroSequence onComplete={handleIntroComplete} />}

      {phase === "setup" && (
        <ProfileSetup
          onComplete={handleProfileComplete}
          initialProfile={userProfile}
          onBack={userProfile ? () => setPhase("hub") : null}
        />
      )}

      {phase === "hub" && (
        <MissionHub
          userProfile={userProfile}
          onStartMission={() => setPhase("modeSelect")}
          onGoToSocial={() => handleSelectMode('social', 0)}
          onGoToProfile={() => setPhase("setup")}
          onGoToLeaderboard={() => setPhase("leaderboard")}
        />
      )}

      {phase === "modeSelect" && (
        <ModeSelection
          onSelectMode={handleSelectMode}
          onBack={() => setPhase("hub")}
        />
      )}

      {phase === "gameplay" && (
        <GameSession
          mode={gameMode}
          scenarioLimit={scenarioLimit}
          onComplete={handleGameComplete}
          onExit={() => setPhase("hub")}
        />
      )}

      {phase === "social" && (
        <SocialArena onExit={() => setPhase("hub")} />
      )}

      {phase === "results" && gameResults && (
        <ResultsScreen
          results={gameResults}
          onViewLeaderboard={() => setPhase("leaderboard")}
          onPlayAgain={handlePlayAgain}
          onGoHome={() => setPhase("hub")}
        />
      )}

      {phase === "leaderboard" && (
        <LeaderboardScreen onBack={() => setPhase("hub")} />
      )}
    </GameProvider>
  );
}

export default App;
