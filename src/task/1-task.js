import { namespaceWrapper } from "@_koii/namespace-wrapper";
import express from "express";
import path from "path";

export async function task(roundNumber) {
  // Run your task and store the proofs to be submitted for auditing
  // The submission of the proofs is done in the submission function
  try {
    console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);

  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
  }
}
