import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { KoiiStorageClient } from "@_koii/storage-task-sdk";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import open from "open";

export async function setup() {
  console.log("CUSTOM SETUP");

  // Define files to download for the game
  const files = [
    {
      cid: "bafybeidmakt2gll7skn344whg4pekslc7oekauswan7efgsu5a2yjfdy2a",
      name: "main.html",
    },
    {
      cid: "bafybeieik7mttaubfmsqeaofshvzwzg35ckdqlprudnq5lqzzyeiae46ki",
      name: "bundle.jsdos",
    },
    {
      cid: "bafybeiatydrn6mnqqf425nhnieqif2lamcqzjwlwtbndhta7e4l7vmw6pa",
      name: "js-dos.js",
    },
    {
      cid: "bafybeie36usyziyly3qlhkvcikmwozcz3e2btomu7pm63fw4ryf3cbn26e",
      name: "js-dos.css",
    },
  ];

  // get the base path
  const getBasePath = await namespaceWrapper.getBasePath();

  // get the file from the storage if available
  const client = new KoiiStorageClient(undefined, undefined, true);

  // game folder
  const projectPrefix = path.join(getBasePath, `gamedir`);

  // Ensure the folder exists
  try {
    if (!existsSync(projectPrefix)) {
      mkdirSync(projectPrefix, { recursive: true });
    } else {
      console.log("folder is created");
    }
  } catch (error) {
    console.log(error);
  }

  // Download all files that don't exist
  for (const file of files) {
    const cid = file.cid;
    const fileName = file.name;
    const pathToFile = path.join(projectPrefix, fileName);

    console.log(`Processing ${fileName}...`);
    try {
      if (!existsSync(pathToFile)) {
        console.log("Downloading file", fileName);
        const blob = await client.getFile(cid, fileName);
        let fileData;
        if (
          fileName.endsWith(".html") ||
          fileName.endsWith(".js") ||
          fileName.endsWith(".css")
        ) {
          fileData = await blob.text();
        } else {
          const buffer = await blob.arrayBuffer();
          fileData = Buffer.from(buffer);
        }

        try {
          writeFileSync(pathToFile, fileData);
        } catch (err) {
          console.error("Error writing file:", err);
        }

        console.log(`Successfully downloaded and wrote ${fileName}`);
      } else {
        console.log("Already exist in folder:", fileName);
      }
    } catch (error) {
      console.error("errors :", err);
    }
  }

  // Get Task ID and open browser
  const taskIdString = process.argv[3];
  console.log("taskID is ", taskIdString);

  if (taskIdString !== undefined) {
    console.log("Attempting to open URL");
    open(`http://localhost:30017/task/${taskIdString}/main.html`);
  }
}
