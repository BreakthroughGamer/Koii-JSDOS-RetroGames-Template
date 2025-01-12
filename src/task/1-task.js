import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function task(roundNumber) {
  try {
    console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);
    
    // Get the game state and score
    const gameState = await namespaceWrapper.storeGet("gameState") || "waiting";
    const gameScore = await namespaceWrapper.storeGet("currentGameScore");
    const lastUpdateTime = await namespaceWrapper.storeGet("lastScoreUpdate");
    
    console.log(`Current game state: ${gameState}, Score: ${gameScore}, Last Update: ${lastUpdateTime}`);
    
    // If game is not finished, don't process the score
    if (gameState !== "finished") {
      console.log("Game not finished yet, waiting for completion");
      return null;
    }
    
    // Validate score
    if (gameScore === null || gameScore === undefined || isNaN(Number(gameScore)) || Number(gameScore) <= 0) {
      console.log("Invalid or zero score, skipping submission");
      return null;
    }

    // Validate last update time
    const currentTime = Date.now();
    const maxTimeOffset = 5 * 60 * 1000; // 5 minutes
    if (!lastUpdateTime || Math.abs(currentTime - lastUpdateTime) > maxTimeOffset) {
      console.log("Score update time invalid or too old");
      return null;
    }
    
    // Additional security checks
    const previousScores = await namespaceWrapper.storeGet("previousScores") || [];
    const finalScore = Number(gameScore);
    
    // Check for suspicious score patterns
    if (previousScores.length > 0) {
      const avgScore = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
      const maxAllowedScore = avgScore * 3; // Score can't be more than 3x the average
      
      if (finalScore > maxAllowedScore) {
        console.log("Suspicious score detected, skipping submission");
        return null;
      }
    }
    
    // Store the validated score for submission
    await namespaceWrapper.storeSet("gameScore", finalScore);
    
    // Update previous scores
    previousScores.push(finalScore);
    if (previousScores.length > 10) previousScores.shift(); // Keep last 10 scores
    await namespaceWrapper.storeSet("previousScores", previousScores);
    
    // Reset game state for next round
    await namespaceWrapper.storeSet("gameState", "waiting");
    await namespaceWrapper.storeSet("currentGameScore", 0);
    await namespaceWrapper.storeSet("lastScoreUpdate", null);
    
    console.log(`Processed final score for round ${roundNumber}: ${finalScore}`);
    
    return finalScore;

  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
    return null;
  }
}
