import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function submission(roundNumber) {
  /**
   * Submit the task proofs for auditing
   * Must return a string of max 512 bytes to be submitted on chain
   */
  try {
    console.log(`No submissions, this is a local game ${roundNumber}`);
    // return await namespaceWrapper.storeGet("value");
  } catch (error) {
    console.error("MAKE SUBMISSION ERROR:", error);
  }
}
