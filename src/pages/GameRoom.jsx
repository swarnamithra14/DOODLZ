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
import { 
  sendStroke, 
  subscribeToStrokes, 
  clearStrokesInFirestore, 
  sendChatMessage, 
  subscribeToChatMessages, 
  setAuthoritativeTurn, 
  subscribeToSecretWord, 
  awardPlayerScore 
} from '../services/gameService.js';
import { subscribeToRoom, subscribeToPlayers } from '../services/roomService.js';
import { isFirebaseConfigured } from '../services/firebase.js';
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
  const [publicHint, setPublicHint] = useState('');
  const [publicCategory, setPublicCategory] = useState('');
  const [usedWords, setUsedWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [roundIntermission, setRoundIntermission] = useState(false);
  const [intermissionCountdown, setIntermissionCountdown] = useState(4);

  // Drawing state
  const [strokes, setStrokes] = useState([]);

  // Scores and guessing state
  const [gamePlayers, setGamePlayers] = useState(() => 
    players.map(p => ({ ...p, score: p.score || 0 }))
  );
  const [correctGuesserIds, setCorrectGuesserIds] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Active drawer identity
  const currentDrawer = gamePlayers[currentDrawerIndex] || gamePlayers[0];
  const isDrawer = currentDrawer?.id === currentUser?.id;
  const isHost = currentUser?.isHost || false;
  const hasCurrentUserGuessed = correctGuesserIds.includes(currentUser?.id);

  // 1. REALTIME FIRESTORE SUBSCRIPTIONS (when connected to Firebase)
  useEffect(() => {
    if (!isFirebaseConfigured() || !roomCode) return;

    // A. Subscribe to live strokes across all screens
    const unsubStrokes = subscribeToStrokes(roomCode, (liveStrokes) => {
      // Guessers always sync all live strokes
      if (!isDrawer) {
        setStrokes(liveStrokes);
      }
    });

    // B. Subscribe to live chat / guess feed
    const unsubChat = subscribeToChatMessages(roomCode, (liveMessages) => {
      setChatMessages(liveMessages);
    });

    // C. Subscribe to player scores & roster
    const unsubPlayers = subscribeToPlayers(roomCode, (livePlayers) => {
      if (livePlayers && livePlayers.length > 0) {
        setGamePlayers(livePlayers);
      }
    });

    // D. Subscribe to public room metadata (hints, category, turn sync)
    const unsubRoom = subscribeToRoom(roomCode, (roomData) => {
      if (roomData) {
        if (roomData.currentHint) setPublicHint(roomData.currentHint);
        if (roomData.currentCategory) setPublicCategory(roomData.currentCategory);
        if (roomData.currentRound) setCurrentRound(roomData.currentRound);
        if (roomData.currentDrawerId) {
          const idx = gamePlayers.findIndex(p => p.id === roomData.currentDrawerId);
          if (idx !== -1 && idx !== currentDrawerIndex) {
            setCurrentDrawerIndex(idx);
          }
        }
      }
    });

    return () => {
      unsubStrokes();
      unsubChat();
      unsubPlayers();
      unsubRoom();
    };
  }, [roomCode, isDrawer, currentDrawerIndex, gamePlayers.length]);

  // E. Drawer subscribes to protected secret word
  useEffect(() => {
    if (!isFirebaseConfigured() || !roomCode || !isDrawer) return;

    const unsubSecret = subscribeToSecretWord(roomCode, (secretData) => {
      if (secretData) {
        setCurrentWordItem({
          word: secretData.word,
          category: secretData.category,
          difficulty: 'medium'
        });
      }
    });

    return () => unsubSecret();
  }, [roomCode, isDrawer]);

  // Start new turn (Host coordinates word selection & turn initiation)
  const startNewTurn = () => {
    const wordItem = getRandomWord(usedWords);
    setCurrentWordItem(wordItem);
    setPublicHint(getWordHint(wordItem.word));
    setPublicCategory(wordItem.category);
    setUsedWords(prev => [...prev, wordItem.word]);
    setStrokes([]);
    setCorrectGuesserIds([]);
    setTimeLeft(ROUND_TIME_SECONDS);
    setRoundIntermission(false);
    setIsRoundActive(true);

    const activeDrawer = gamePlayers[currentDrawerIndex] || gamePlayers[0];
    const drawerName = activeDrawer?.name || 'Drawer';

    // If host and Firebase is live: synchronize authoritative turn across all clients
    if (isFirebaseConfigured() && isHost) {
      setAuthoritativeTurn(roomCode, {
        drawerId: activeDrawer.id,
        word: wordItem.word,
        category: wordItem.category,
        hint: getWordHint(wordItem.word),
        round: currentRound
      });
    }

    const startMsg = {
      type: 'system',
      text: `🎨 Round ${currentRound}: ${drawerName} is drawing now!`,
      isSuccess: false,
      senderId: 'system',
      senderName: 'System'
    };

    if (isFirebaseConfigured()) {
      sendChatMessage(roomCode, startMsg);
    } else {
      setChatMessages(prev => [...prev, startMsg]);
    }
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

    const endMsg = {
      type: 'system',
      text: `⏰ Time's up! The secret word was: ${currentWordItem?.word || '??'}`,
      isSuccess: false,
      senderId: 'system',
      senderName: 'System'
    };

    if (isFirebaseConfigured()) {
      sendChatMessage(roomCode, endMsg);
    } else {
      setChatMessages(prev => [...prev, endMsg]);
    }
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
        onGameEnd(gamePlayers);
        return;
      } else {
        setCurrentRound(prev => prev + 1);
        setCurrentDrawerIndex(0);
        startNewTurn();
      }
    } else {
      setCurrentDrawerIndex(nextDrawerIndex);
      startNewTurn();
    }
  };

  // Drawer creates or updates a stroke
  const handleStrokesChange = (newStrokes) => {
    setStrokes(newStrokes);

    // Send newly completed stroke to Firestore for all other players to see!
    if (isFirebaseConfigured() && newStrokes.length > 0) {
      const latestStroke = newStrokes[newStrokes.length - 1];
      sendStroke(roomCode, latestStroke);
    }
  };

  // Drawer clears canvas
  const handleClearCanvas = () => {
    setStrokes([]);
    if (isFirebaseConfigured()) {
      clearStrokesInFirestore(roomCode);
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

      // Award points in Firestore
      if (isFirebaseConfigured()) {
        awardPlayerScore(roomCode, guesser.id, points);
        awardPlayerScore(roomCode, currentDrawer.id, drawerBonus);
      } else {
        setGamePlayers(prev => 
          prev.map(p => {
            if (p.id === guesser.id) return { ...p, score: (p.score || 0) + points };
            if (p.id === currentDrawer.id) return { ...p, score: (p.score || 0) + drawerBonus };
            return p;
          })
        );
      }

      const nextGuesserList = [...correctGuesserIds, guesser.id];
      setCorrectGuesserIds(nextGuesserList);

      const successMsg = {
        type: 'system',
        text: `🎉 ${guesser.name} guessed the word! (+${points} pts)`,
        isSuccess: true,
        senderId: 'system',
        senderName: 'System'
      };

      if (isFirebaseConfigured()) {
        sendChatMessage(roomCode, successMsg);
      } else {
        setChatMessages(prev => [...prev, successMsg]);
      }

      // If all other players have guessed correctly, end turn early
      const totalGuessersCount = gamePlayers.length - 1;
      if (nextGuesserList.length >= totalGuessersCount && totalGuessersCount > 0) {
        endTurn();
      }
      return;
    }

    // Check close guess (1 typo away)
    if (isCloseGuess(rawGuess, secret)) {
      const guessMsg = {
        type: 'guess',
        senderId: guesser.id,
        senderName: guesser.name,
        text: rawGuess
      };
      const closeMsg = {
        type: 'close',
        text: `💡 ${guesser.name}'s guess is very close!`,
        senderId: 'system',
        senderName: 'System'
      };

      if (isFirebaseConfigured()) {
        sendChatMessage(roomCode, guessMsg);
        sendChatMessage(roomCode, closeMsg);
      } else {
        setChatMessages(prev => [...prev, guessMsg, closeMsg]);
      }
      return;
    }

    // Regular guess
    const normalMsg = {
      type: 'guess',
      senderId: guesser.id,
      senderName: guesser.name,
      text: rawGuess
    };

    if (isFirebaseConfigured()) {
      sendChatMessage(roomCode, normalMsg);
    } else {
      setChatMessages(prev => [...prev, normalMsg]);
    }
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

    const drawingInterval = setInterval(() => {
      if (strokeIndex < botStrokes.length) {
        const nextStroke = botStrokes[strokeIndex];
        setStrokes(prev => [...prev, nextStroke]);
        if (isFirebaseConfigured()) {
          sendStroke(roomCode, nextStroke);
        }
        strokeIndex++;
      } else {
        clearInterval(drawingInterval);
      }
    }, 1400);

    return () => clearInterval(drawingInterval);
  }, [isRoundActive, roundIntermission, currentDrawerIndex, currentWordItem, roomCode]);

  // BOT AI SIMULATION 2: Bots submit guesses when someone else is drawing
  useEffect(() => {
    if (!isRoundActive || roundIntermission || !currentWordItem) return;

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

      // 3. Successful correct guess after 24-28 seconds
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
                You are drawing ({currentWordItem?.category || publicCategory || 'Word'})
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
                {currentWordItem?.word || 'Thinking...'}
              </div>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-accent-blue)', fontWeight: 700, letterSpacing: '1px' }}>
                Secret Word Hint ({publicCategory ? `${publicCategory} · ` : ''}{getWordLengthDescription(currentWordItem?.word || publicHint)})
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
                {publicHint || getWordHint(currentWordItem?.word)}
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
            onStrokesChange={handleStrokesChange}
            onClearCanvas={handleClearCanvas}
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
                The secret word was <strong style={{ color: '#FFD129', fontSize: '1.4rem' }}>{currentWordItem?.word || '??'}</strong>
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
