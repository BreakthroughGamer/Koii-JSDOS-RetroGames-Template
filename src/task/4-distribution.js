const SLASH_PERCENT = 0; // 70% slash for incorrect submissions
const MIN_SCORE_FOR_REWARD = 20; // Minimum score required to receive a reward

export function distribution(submitters, bounty, roundNumber) {
  console.log(`MAKE DISTRIBUTION LIST FOR ROUND ${roundNumber}`);
  console.log('Total bounty for distribution:', bounty);

  // Initialize the distribution list
  const distributionList = {};
  
  // Handle invalid submissions first - apply slashing
  submitters.filter(s => s.votes < 0).forEach(submitter => {
    const slashedStake = Math.floor(submitter.stake * SLASH_PERCENT);
    distributionList[submitter.publicKey] = -slashedStake; // Negative value indicates slashing
    console.log("SLASHED STAKE:", submitter.publicKey, slashedStake);
  });

  // Get all valid submitters (excluding null submissions which were accepted)
  const validSubmitters = submitters.filter(s => {
    try {
      if (s.votes <= 0) return false;
      const submission = JSON.parse(s.submission);
      return submission && submission.score > 0;
    } catch {
      return false;
    }
  });
  
  // If no valid submitters with scores, return just the slashing results
  if (validSubmitters.length === 0) {
    console.log("NO VALID SUBMISSIONS WITH SCORES TO REWARD");
    return distributionList;
  }

  // Calculate scores for valid submitters
  const submitterScores = validSubmitters.map(submitter => {
    try {
      const submission = JSON.parse(submitter.submission);
      return {
        publicKey: submitter.publicKey,
        score: Number(submission.score)
      };
    } catch (error) {
      console.error("Error parsing submission:", error);
      return null;
    }
  }).filter(s => s !== null);

  // Filter out submissions below minimum score
  const qualifiedSubmitters = submitterScores.filter(s => s.score >= MIN_SCORE_FOR_REWARD);
  
  if (qualifiedSubmitters.length === 0) {
    console.log("NO QUALIFIED SUBMISSIONS ABOVE MINIMUM SCORE");
    return distributionList;
  }

  // Calculate total score of qualified submitters
  const totalScore = qualifiedSubmitters.reduce((sum, s) => sum + s.score, 0);

  // Distribute rewards proportionally to scores
  qualifiedSubmitters.forEach(submitter => {
    try {
      // Calculate reward proportional to score
      const reward = totalScore > 0 
        ? Math.floor((submitter.score / totalScore) * bounty)
        : Math.floor(bounty / qualifiedSubmitters.length);
      
      distributionList[submitter.publicKey] = reward;
      console.log("REWARD:", submitter.publicKey, reward, "Score:", submitter.score);
    } catch (error) {
      console.error("Error calculating reward:", error);
      distributionList[submitter.publicKey] = 0;
    }
  });

  // Verify total distribution doesn't exceed bounty
  const totalDistributed = Object.values(distributionList)
    .filter(v => v > 0)
    .reduce((sum, v) => sum + v, 0);
    
  if (totalDistributed > bounty) {
    console.warn("Distribution exceeded bounty, adjusting rewards");
    const adjustment = bounty / totalDistributed;
    Object.keys(distributionList).forEach(key => {
      if (distributionList[key] > 0) {
        distributionList[key] = Math.floor(distributionList[key] * adjustment);
      }
    });
  }

  return distributionList;
}
