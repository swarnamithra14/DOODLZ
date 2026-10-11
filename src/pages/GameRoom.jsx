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
  awardPlayerScore,
  updateRoomCountdown,
  setIntermissionInFirestore,
  endGameInFirestore,
  addCorrectGuesserInFirestore
} from '../services/gameService.js';
import { subscribeToRoom, subscribeToPlayers } from '../services/roomService.js';
import { isFirebaseConfigured } from '../services/firebase.js';
import { Clock, Award, LogOut } from 'lucide-react';

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
  const [currentDrawerId, setCurrentDrawerId] = useState(players[0]?.id || '');
  const [currentWordItem, setCurrentWordItem] = useState(null);
  const [publicHint, setPublicHint] = useState('');
  const [publicCategory, setPublicCategory] = useState('');
  const [revealedWord, setRevealedWord] = useState('');
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

  // Roles
  const isHost = currentUser?.isHost || false;
  const isDrawer = currentDrawerId === currentUser?.id;
  const currentDrawer = gamePlayers.find(p => p.id === currentDrawerId) || gamePlayers[0];
  const hasCurrentUserGuessed = correctGuesserIds.includes(currentUser?.id);

  // Keep track of evaluated message IDs by host to prevent duplicate scoring
  const evaluatedMsgIdsRef = useRef(new Set());

  // 1. REALTIME FIRESTORE SUBSCRIPTIONS
  useEffect(() => {
    if (!isFirebaseConfigured() || !roomCode) return;

    // A. Subscribe to live strokes
    const unsubStrokes = subscribeToStrokes(roomCode, (liveStrokes) => {
      if (!isDrawer) {
        setStrokes(liveStrokes);
      }
    });

    // B. Subscribe to live chat feed
    const unsubChat = subscribeToChatMessages(roomCode, (liveMessages) => {
      setChatMessages(liveMessages);
    });

    // C. Subscribe to player scores & roster
    const unsubPlayers = subscribeToPlayers(roomCode, (livePlayers) => {
      if (livePlayers && livePlayers.length > 0) {
        setGamePlayers(livePlayers);
      }
    });

    // D. Subscribe to authoritative room metadata (syncs rounds, turns, timer across all screens)
    const unsubRoom = subscribeToRoom(roomCode, (roomData) => {
      if (!roomData) return;

      if (roomData.status === 'ended') {
        onGameEnd(gamePlayers);
        return;
      }

      if (roomData.currentRound !== undefined) setCurrentRound(roomData.currentRound);
      if (roomData.currentDrawerIndex !== undefined) setCurrentDrawerIndex(roomData.currentDrawerIndex);
      if (roomData.currentDrawerId) setCurrentDrawerId(roomData.currentDrawerId);
      if (roomData.currentHint !== undefined) setPublicHint(roomData.currentHint);
      if (roomData.currentCategory !== undefined) setPublicCategory(roomData.currentCategory);
      if (roomData.correctGuesserIds) setCorrectGuesserIds(roomData.correctGuesserIds);
      if (roomData.isIntermission !== undefined) setRoundIntermission(roomData.isIntermission);
      if (roomData.revealedWord) setRevealedWord(roomData.revealedWord);

      // Non-hosts synchronize countdown timer from authoritative room state
      if (!isHost && roomData.timeLeft !== undefined) {
        setTimeLeft(roomData.timeLeft);
      }
    });

    return () => {
      unsubStrokes();
      unsubChat();
      unsubPlayers();
      unsubRoom();
    };
  }, [roomCode, isDrawer, isHost, gamePlayers.length]);

  // E. Secret word subscription for the drawer
  useEffect(() => {
    if (!isFirebaseConfigured() || !roomCode || !isDrawer) return;

    const unsubSecret = subscribeToSecretWord(roomCode, (secretData) => {
      if (secretData) {
        setCurrentWordItem({
          word: secretData.word,
          category: secretData.category
        });
      }
    });

    return () => unsubSecret();
  }, [roomCode, isDrawer]);

  // HOST-ONLY: Starts a new turn and publishes authoritative turn data to Firestore
  const hostStartNewTurn = async (drawerIdx = 0, roundNum = 1) => {
    const wordItem = getRandomWord(usedWords);
    setCurrentWordItem(wordItem);
    setUsedWords(prev => [...prev, wordItem.word]);
    setPublicHint(getWordHint(wordItem.word));
    setPublicCategory(wordItem.category);
    setStrokes([]);
    setCorrectGuesserIds([]);
    setTimeLeft(ROUND_TIME_SECONDS);
    setRoundIntermission(false);
    setIsRoundActive(true);

    const activeDrawer = gamePlayers[drawerIdx] || gamePlayers[0];
    setCurrentDrawerIndex(drawerIdx);
    setCurrentDrawerId(activeDrawer.id);

    if (isFirebaseConfigured()) {
      await setAuthoritativeTurn(roomCode, {
        drawerId: activeDrawer.id,
        drawerIndex: drawerIdx,
        word: wordItem.word,
        category: wordItem.category,
        hint: getWordHint(wordItem.word),
        round: roundNum,
        timeLeft: ROUND_TIME_SECONDS
      });

      await sendChatMessage(roomCode, {
        type: 'system',
        text: `🎨 Round ${roundNum}: ${activeDrawer.name} is drawing now!`,
        isSuccess: false,
        senderId: 'system',
        senderName: 'System'
      });
    } else {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'system',
          text: `🎨 Round ${roundNum}: ${activeDrawer.name} is drawing now!`,
          isSuccess: false
        }
      ]);
    }
  };

  // Initial turn mount: Host initiates turn 1
  useEffect(() => {
    if (isHost || !isFirebaseConfigured()) {
      hostStartNewTurn(0, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HOST-ONLY: Countdown timer interval
  useEffect(() => {
    if (!isRoundActive || roundIntermission) return;
    if (!isHost && isFirebaseConfigured()) return; // Non-hosts sync from Firestore

    if (timeLeft <= 0) {
      handleEndTurn();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = prev - 1;
        if (isFirebaseConfigured() && isHost && nextTime % 2 === 0) {
          // Sync countdown to Firestore every 2s
          updateRoomCountdown(roomCode, nextTime);
        }
        if (nextTime <= 0) {
          clearInterval(timer);
          handleEndTurn();
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoundActive, roundIntermission, timeLeft, isHost]);

  // Turn ending logic
  const handleEndTurn = async () => {
    setIsRoundActive(false);
    setRoundIntermission(true);
    setIntermissionCountdown(4);
    const wordToReveal = currentWordItem?.word || revealedWord || '??';
    setRevealedWord(wordToReveal);

    if (isFirebaseConfigured() && isHost) {
      await setIntermissionInFirestore(roomCode, wordToReveal);
      await sendChatMessage(roomCode, {
        type: 'system',
        text: `⏰ Time's up! The secret word was: ${wordToReveal}`,
        isSuccess: false,
        senderId: 'system',
        senderName: 'System'
      });
    } else if (!isFirebaseConfigured()) {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'system',
          text: `⏰ Time's up! The secret word was: ${wordToReveal}`,
          isSuccess: false
        }
      ]);
    }
  };

  // Intermission countdown
  useEffect(() => {
    if (!roundIntermission) return;

    if (intermissionCountdown <= 0) {
      if (isHost || !isFirebaseConfigured()) {
        advanceToNextTurn();
      }
      return;
    }

    const timer = setInterval(() => {
      setIntermissionCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIntermission, intermissionCountdown, isHost]);

  // HOST-ONLY: Advance to next drawer and round
  const advanceToNextTurn = async () => {
    const nextDrawerIdx = currentDrawerIndex + 1;

    // Check if everyone has had a chance to draw this round
    if (nextDrawerIdx >= gamePlayers.length) {
      const nextRoundNum = currentRound + 1;
      if (nextRoundNum > TOTAL_ROUNDS) {
        // Game Complete!
        if (isFirebaseConfigured()) {
          await endGameInFirestore(roomCode);
        }
        onGameEnd(gamePlayers);
      } else {
        // Next round: reset drawer to player 0
        setCurrentRound(nextRoundNum);
        hostStartNewTurn(0, nextRoundNum);
      }
    } else {
      // Next drawer within current round
      hostStartNewTurn(nextDrawerIdx, currentRound);
    }
  };

  // HOST-ONLY: Evaluate all incoming guesses in real time
  useEffect(() => {
    if (!isHost && isFirebaseConfigured()) return;
    if (chatMessages.length === 0 || roundIntermission) return;

    const secret = currentWordItem?.word || '';
    if (!secret) return;

    const latestMsg = chatMessages[chatMessages.length - 1];
    if (!latestMsg || latestMsg.type !== 'guess') return;

    // Prevent re-evaluating the same message
    const msgKey = latestMsg.msgDocId || `${latestMsg.senderId}_${latestMsg.clientTimestamp}_${latestMsg.text}`;
    if (evaluatedMsgIdsRef.current.has(msgKey)) return;
    evaluatedMsgIdsRef.current.add(msgKey);

    const guesserId = latestMsg.senderId;

    // Disallow drawer from guessing or duplicate guesses
    if (guesserId === currentDrawerId || correctGuesserIds.includes(guesserId)) {
      return;
    }

    // Check if correct
    if (isCorrectGuess(latestMsg.text, secret)) {
      const order = correctGuesserIds.length;
      const points = calculateGuesserPoints(timeLeft, ROUND_TIME_SECONDS, order);
      const drawerBonus = calculateDrawerPoints(1);

      if (isFirebaseConfigured()) {
        awardPlayerScore(roomCode, guesserId, points);
        awardPlayerScore(roomCode, currentDrawerId, drawerBonus);
        addCorrectGuesserInFirestore(roomCode, guesserId);

        sendChatMessage(roomCode, {
          type: 'system',
          text: `🎉 ${latestMsg.senderName} guessed the word! (+${points} pts)`,
          isSuccess: true,
          senderId: 'system',
          senderName: 'System'
        });
      } else {
        setGamePlayers(prev => 
          prev.map(p => {
            if (p.id === guesserId) return { ...p, score: (p.score || 0) + points };
            if (p.id === currentDrawerId) return { ...p, score: (p.score || 0) + drawerBonus };
            return p;
          })
        );
        setCorrectGuesserIds(prev => [...prev, guesserId]);
        setChatMessages(prev => [
          ...prev,
          {
            type: 'system',
            text: `🎉 ${latestMsg.senderName} guessed the word! (+${points} pts)`,
            isSuccess: true
          }
        ]);
      }

      // If all guessers have guessed, end turn immediately!
      const totalGuessersCount = gamePlayers.length - 1;
      const updatedCount = correctGuesserIds.length + 1;
      if (updatedCount >= totalGuessersCount && totalGuessersCount > 0) {
        handleEndTurn();
      }
      return;
    }

    // Check if close guess (1 typo away)
    if (isCloseGuess(latestMsg.text, secret)) {
      const closeMsg = {
        type: 'close',
        text: `💡 ${latestMsg.senderName}'s guess is very close!`,
        senderId: 'system',
        senderName: 'System'
      };

      if (isFirebaseConfigured()) {
        sendChatMessage(roomCode, closeMsg);
      } else {
        setChatMessages(prev => [...prev, closeMsg]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages, isHost, currentWordItem?.word, correctGuesserIds, currentDrawerId, roundIntermission, timeLeft]);

  // Drawer creates or updates a stroke
  const handleStrokesChange = (newStrokes) => {
    setStrokes(newStrokes);
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

  // Handle human guess input
  const handleSendGuess = (rawGuess) => {
    if (isDrawer || hasCurrentUserGuessed || roundIntermission) return;

    const normalMsg = {
      type: 'guess',
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: rawGuess
    };

    if (isFirebaseConfigured()) {
      sendChatMessage(roomCode, normalMsg);
    } else {
      setChatMessages(prev => [...prev, normalMsg]);
    }
  };

  // BOT AI (for solo testing when bots exist)
  useEffect(() => {
    if (!isRoundActive || roundIntermission || !currentWordItem) return;
    const isBotDrawing = currentDrawerId?.startsWith('bot_');
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
  }, [isRoundActive, roundIntermission, currentDrawerId, currentWordItem, roomCode]);

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
                {currentWordItem?.word || 'Loading secret word...'}
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
          currentDrawerId={currentDrawerId}
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
                backgroundColor: 'rgba(24, 24, 36, 0.85)',
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
                The secret word was <strong style={{ color: '#FFD129', fontSize: '1.4rem' }}>{revealedWord || currentWordItem?.word || '??'}</strong>
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
