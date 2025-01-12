import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function submission(roundNumber) {
  try {
    console.log(`CHECKING SUBMISSION FOR ROUND ${roundNumber}`);
    
    // Get the stored game score
    const gameScore = await namespaceWrapper.storeGet("gameScore");
    
    // Skip submission if no valid score
    if (gameScore === null || gameScore === undefined || Number(gameScore) <= 0) {
      console.log("No valid score to submit, skipping submission");
      return null;
    }
    
    console.log(`Submitting score for round ${roundNumber}: ${gameScore}`);
    
    // Create a submission proof containing the score and metadata
    const submissionProof = JSON.stringify({
      score: Number(gameScore),
      timestamp: Date.now(),
      round: roundNumber,
      node: await namespaceWrapper.getNodes()
    });
    
    // Verify submission size
    if (submissionProof.length > 512) {
      console.warn("Submission proof too large, truncating node info");
      // Create a smaller proof without node info if too large
      const smallerProof = JSON.stringify({
        score: Number(gameScore),
        timestamp: Date.now(),
        round: roundNumber
      });
      return smallerProof;
    }
    
    return submissionProof;
    
  } catch (error) {
    console.error("MAKE SUBMISSION ERROR:", error);
    return null; 
  }
}
