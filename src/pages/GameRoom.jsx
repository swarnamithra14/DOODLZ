import React, { useState, useEffect, useRef } from 'react';
import DrawingCanvas from '../components/DrawingCanvas.jsx';
import Scoreboard from '../components/Scoreboard.jsx';
import GuessPanel from '../components/GuessPanel.jsx';
import { getRandomWord, getWordHint, getWordLengthDescription, isCloseGuess } from '../game/wordUtils.js';
import { getBotStrokesForWord, getBotWrongGuess } from '../game/botAI.js';
import { 
  ROUND_TIME_SECONDS, 
  isCorrectGuess, 
  calculateGuesserPoints, 
  calculateDrawerPoints, 
  canPlayerGuess 
} from '../game/scoring.js';
import { Clock, Sparkles, Award, ArrowRight, LogOut } from 'lucide-react';

const TOTAL_ROUNDS = 3;

export default function GameRoom({
  roomCode,
  currentUser,
  players = [],
  onGameEnd,
  onLeaveRoom
}) {
  // Game session state
  const [currentRound, setCurrentRound] = useState(1);
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [currentWordItem, setCurrentWordItem] = useState(null);
  const [usedWords, setUsedWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [roundIntermission, setRoundIntermission] = useState(false);
  const [intermissionCountdown, setIntermissionCountdown] = useState(4);

  // Drawing state
  const [strokes, setStrokes] = useState([]);

  // Scores and guessing state
  const [gamePlayers, setGamePlayers] = useState(() => 
    players.map(p => ({ ...p, score: 0 }))
  );
  const [correctGuesserIds, setCorrectGuesserIds] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Active drawer identity
  const currentDrawer = gamePlayers[currentDrawerIndex] || gamePlayers[0];
  const isDrawer = currentDrawer?.id === currentUser?.id;
  const hasCurrentUserGuessed = correctGuesserIds.includes(currentUser?.id);

  // Start new turn
  const startNewTurn = () => {
    const wordItem = getRandomWord(usedWords);
    setCurrentWordItem(wordItem);
    setUsedWords(prev => [...prev, wordItem.word]);
    setStrokes([]);
    setCorrectGuesserIds([]);
    setTimeLeft(ROUND_TIME_SECONDS);
    setRoundIntermission(false);
    setIsRoundActive(true);

    const drawerName = gamePlayers[currentDrawerIndex]?.name || 'Drawer';
    setChatMessages(prev => [
      ...prev,
      {
        type: 'system',
        text: `🎨 Round ${currentRound}: ${drawerName} is drawing now!`,
        isSuccess: false
      }
    ]);
  };

  // Initial turn mount
  useEffect(() => {
    startNewTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (!isRoundActive || roundIntermission) return;

    if (timeLeft <= 0) {
      endTurn();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoundActive, roundIntermission, timeLeft]);

  // Turn ending logic
  const endTurn = () => {
    setIsRoundActive(false);
    setRoundIntermission(true);
    setIntermissionCountdown(4);

    setChatMessages(prev => [
      ...prev,
      {
        type: 'system',
        text: `⏰ Time's up! The secret word was: ${currentWordItem?.word}`,
        isSuccess: false
      }
    ]);
  };

  // Intermission countdown to next turn or game finish
  useEffect(() => {
    if (!roundIntermission) return;

    if (intermissionCountdown <= 0) {
      advanceTurn();
      return;
    }

    const timer = setInterval(() => {
      setIntermissionCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIntermission, intermissionCountdown]);

  // Advance to next turn or next round or finish game
  const advanceTurn = () => {
    const nextDrawerIndex = currentDrawerIndex + 1;

    // If all players have had a turn to draw in the current round
    if (nextDrawerIndex >= gamePlayers.length) {
      if (currentRound >= TOTAL_ROUNDS) {
        // Game Complete!
        onGameEnd(gamePlayers);
        return;
      } else {
        // Move to next round, reset drawer to first player
        setCurrentRound(prev => prev + 1);
        setCurrentDrawerIndex(0);
        startNewTurn();
      }
    } else {
      // Advance to next drawer within the current round
      setCurrentDrawerIndex(nextDrawerIndex);
      startNewTurn();
    }
  };

  // Generic guess evaluation for any player (human or bot)
  const processPlayerGuess = (guesser, rawGuess) => {
    if (!isRoundActive || roundIntermission || !guesser) return;
    if (!canPlayerGuess(guesser.id, currentDrawer?.id, correctGuesserIds)) return;

    const secret = currentWordItem?.word || '';

    // Check correct guess
    if (isCorrectGuess(rawGuess, secret)) {
      const order = correctGuesserIds.length;
      const points = calculateGuesserPoints(timeLeft, ROUND_TIME_SECONDS, order);
      const drawerBonus = calculateDrawerPoints(1);

      // Update guesser's score and drawer's score
      setGamePlayers(prev => 
        prev.map(p => {
          if (p.id === guesser.id) {
            return { ...p, score: (p.score || 0) + points };
          }
          if (p.id === currentDrawer.id) {
            return { ...p, score: (p.score || 0) + drawerBonus };
          }
          return p;
        })
      );

      const nextGuesserList = [...correctGuesserIds, guesser.id];
      setCorrectGuesserIds(nextGuesserList);

      setChatMessages(prev => [
        ...prev,
        {
          type: 'system',
          text: `🎉 ${guesser.name} guessed the word! (+${points} pts)`,
          isSuccess: true
        }
      ]);

      // If all other players have guessed correctly, end turn early
      const totalGuessersCount = gamePlayers.length - 1;
      if (nextGuesserList.length >= totalGuessersCount && totalGuessersCount > 0) {
        endTurn();
      }
      return;
    }

    // Check close guess (1 typo away)
    if (isCloseGuess(rawGuess, secret)) {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'guess',
          senderId: guesser.id,
          senderName: guesser.name,
          text: rawGuess
        },
        {
          type: 'close',
          text: `💡 ${guesser.name}'s guess is very close!`
        }
      ]);
      return;
    }

    // Regular guess
    setChatMessages(prev => [
      ...prev,
      {
        type: 'guess',
        senderId: guesser.id,
        senderName: guesser.name,
        text: rawGuess
      }
    ]);
  };

  // Handle human guess input
  const handleSendGuess = (rawGuess) => {
    processPlayerGuess(currentUser, rawGuess);
  };

  // BOT AI SIMULATION 1: Progressive drawing when a bot is the active drawer
  useEffect(() => {
    if (!isRoundActive || roundIntermission || !currentWordItem) return;
    const isBotDrawing = currentDrawer?.id?.startsWith('bot_');
    if (!isBotDrawing) return;

    const botStrokes = getBotStrokesForWord(currentWordItem.word, currentWordItem.category);
    let strokeIndex = 0;

    // Draw strokes step-by-step every 1.4 seconds so guessers can watch in real time
    const drawingInterval = setInterval(() => {
      if (strokeIndex < botStrokes.length) {
        const nextStroke = botStrokes[strokeIndex];
        setStrokes(prev => [...prev, nextStroke]);
        strokeIndex++;
      } else {
        clearInterval(drawingInterval);
      }
    }, 1400);

    return () => clearInterval(drawingInterval);
  }, [isRoundActive, roundIntermission, currentDrawerIndex, currentWordItem]);

  // BOT AI SIMULATION 2: Bots submit guesses when someone else is drawing
  useEffect(() => {
    if (!isRoundActive || roundIntermission || !currentWordItem) return;

    // Identify active bot guessers
    const botGuessers = gamePlayers.filter(
      p => p.id?.startsWith('bot_') && p.id !== currentDrawer?.id && !correctGuesserIds.includes(p.id)
    );
    if (botGuessers.length === 0) return;

    const timeouts = [];

    botGuessers.forEach((bot, bIndex) => {
      // 1. Initial wrong guess after 7-9 seconds
      const t1 = setTimeout(() => {
        if (!isRoundActive || roundIntermission) return;
        const wrongGuess = getBotWrongGuess(currentWordItem.word, currentWordItem.category);
        processPlayerGuess(bot, wrongGuess);
      }, 7000 + bIndex * 2000);
      timeouts.push(t1);

      // 2. Second guess after 15-18 seconds
      const t2 = setTimeout(() => {
        if (!isRoundActive || roundIntermission) return;
        const wrongGuess2 = getBotWrongGuess(currentWordItem.word, currentWordItem.category);
        processPlayerGuess(bot, wrongGuess2);
      }, 15000 + bIndex * 2500);
      timeouts.push(t2);

      // 3. Successful correct guess after 24-28 seconds!
      const t3 = setTimeout(() => {
        if (!isRoundActive || roundIntermission) return;
        processPlayerGuess(bot, currentWordItem.word);
      }, 24000 + bIndex * 3000);
      timeouts.push(t3);
    });

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoundActive, roundIntermission, currentDrawerIndex, currentWordItem, correctGuesserIds]);

  return (
    <div className="animate-pop" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Game Bar */}
      <div 
        className="doodle-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.85rem 1.5rem',
          marginBottom: '1rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Round Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span 
            className="badge badge-host"
            style={{ fontSize: '0.95rem', padding: '0.35rem 0.75rem' }}
          >
            Round {currentRound} of {TOTAL_ROUNDS}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Room: <strong>{roomCode}</strong>
          </span>
        </div>

        {/* Word / Hint Display */}
        <div style={{ textAlign: 'center', flex: 1, minWidth: '220px' }}>
          {isDrawer ? (
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '1px' }}>
                You are drawing ({currentWordItem?.category})
              </span>
              <div 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'var(--color-text-main)'
                }}
              >
                {currentWordItem?.word}
              </div>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-accent-blue)', fontWeight: 700, letterSpacing: '1px' }}>
                Secret Word Hint ({getWordLengthDescription(currentWordItem?.word)})
              </span>
              <div 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  letterSpacing: '6px',
                  color: 'var(--color-text-main)'
                }}
              >
                {getWordHint(currentWordItem?.word)}
              </div>
            </div>
          )}
        </div>

        {/* Timer & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Timer Circle */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: timeLeft <= 10 ? '#FEE2E2' : timeLeft <= 20 ? '#FEF3C7' : 'var(--color-bg-alt)',
              color: timeLeft <= 10 ? '#DC2626' : timeLeft <= 20 ? '#D97706' : 'var(--color-text-main)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.85rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.15rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Clock size={18} />
            <span>{timeLeft}s</span>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onLeaveRoom}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: '#EF4444' }}
            title="Leave game"
          >
            <LogOut size={16} />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Main Game Screen 3-Column Layout */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '230px 1fr 280px',
          gap: '1rem',
          alignItems: 'start'
        }}
      >
        {/* Left: Scoreboard */}
        <Scoreboard
          players={gamePlayers}
          currentDrawerId={currentDrawer?.id}
          currentUserId={currentUser?.id}
          correctGuesserIds={correctGuesserIds}
        />

        {/* Center: Interactive Drawing Canvas */}
        <div style={{ position: 'relative' }}>
          <DrawingCanvas
            isDrawer={isDrawer && isRoundActive}
            strokes={strokes}
            onStrokesChange={setStrokes}
            onClearCanvas={() => setStrokes([])}
          />

          {/* Intermission Overlay */}
          {roundIntermission && (
            <div 
              className="animate-pop"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(24, 24, 36, 0.82)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                padding: '2rem',
                textAlign: 'center',
                zIndex: 20
              }}
            >
              <Award size={48} color="#FFD129" style={{ marginBottom: '0.5rem' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                Round Over!
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#E2E8F0', marginBottom: '1rem' }}>
                The secret word was <strong style={{ color: '#FFD129', fontSize: '1.4rem' }}>{currentWordItem?.word}</strong>
              </p>
              <div 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.95rem'
                }}
              >
                Next turn in <strong>{intermissionCountdown}</strong> seconds...
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-time Guess Feed & Input */}
        <GuessPanel
          messages={chatMessages}
          onSendGuess={handleSendGuess}
          isDrawer={isDrawer}
          hasGuessed={hasCurrentUserGuessed}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
}
