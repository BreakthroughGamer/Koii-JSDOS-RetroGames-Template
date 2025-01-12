import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function audit(submission, roundNumber, submitterKey) {
  try {
    console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber} from ${submitterKey}`);
    
    // Handle null submissions (game not finished)
    if (!submission) {
      console.log('Null submission - game likely not finished, skipping audit');
      return true; 
    }
    
    // Parse the submission proof
    const submissionData = JSON.parse(submission);
    
    // Required fields validation
    if (!submissionData || 
        typeof submissionData.score !== 'number' || 
        !submissionData.timestamp || 
        submissionData.round !== roundNumber) {
      console.log('Invalid submission format or missing required fields');
      return false;
    }
    
    // Score validation - must be positive for actual submissions
    if (submissionData.score <= 0 || !Number.isFinite(submissionData.score)) {
      console.log('Invalid score value');
      return false;
    }
    
    // Timestamp validation (within acceptable range)
    const submissionTime = new Date(submissionData.timestamp);
    const currentTime = Date.now();
    const maxTimeOffset = 24 * 60 * 60 * 1000;
    
    if (Math.abs(currentTime - submissionTime) > maxTimeOffset) {
      console.log('Submission timestamp outside acceptable range');
      return false;
    }
    
    // Node validation if node info is present
    if (submissionData.node) {
      const nodes = await namespaceWrapper.getNodes();
      if (!nodes.includes(submitterKey)) {
        console.log('Submitter not in valid node list');
        return false;
      }
    }
    
    console.log(`Valid submission with score: ${submissionData.score}`);
    return true;
    
  } catch (error) {
    console.error("AUDIT ERROR:", error);
    return false;
  }
}
