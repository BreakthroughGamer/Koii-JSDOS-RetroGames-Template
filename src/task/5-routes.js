import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import path from "path";
import fs from "fs/promises";
import express from "express";

export function routes() {
  /**
   *
   * Define all your custom routes here
   *
   */

  
  // Define the directory and file paths
  const folderPathBase = __dirname.split('/').slice(0, -1).join('/');
  const folderPath = path.join(folderPathBase + "/namespace/" + process.argv[3],  "gamedir");
  console.log('folderPath is ', folderPath)

  app.use(express.static(folderPath));
  
  const mainHtmlFilePath = path.join(folderPath, "main.html");

  console.log(mainHtmlFilePath);

  // Serve the HTML file at the `/game` endpoint
  app.get("/game", async (req, res) => {
    try {
      // Check if the file exists
      let result = await (async () => {
        await namespaceWrapper.fs('stat', mainHtmlFilePath);
      })
      console.log('html file check result is ', result);
      // Send the HTML file
      res.sendFile(mainHtmlFilePath);

    } catch (error) {
      console.error("Error serving main.html:", error);
      res.status(404).send("Game HTML file not found");
    }
  });
}
