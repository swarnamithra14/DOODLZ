/**
 * Authoritative scoring calculator
 */
class ScoreManager {
  calculateGuessScore(remainingSeconds, totalDuration) {
    const baseScore = 200;
    const speedRatio = Math.max(0, Math.min(1, remainingSeconds / totalDuration));
    const bonusScore = Math.round(speedRatio * 300);
    return baseScore + bonusScore;
  }

  calculateDrawerScore(correctGuessCount, totalEligiblePlayers) {
    if (totalEligiblePlayers === 0) return 0;
    const basePerGuess = 50;
    return correctGuessCount * basePerGuess;
  }
}

export const scoreManager = new ScoreManager();
export default scoreManager;
