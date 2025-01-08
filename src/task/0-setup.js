import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { KoiiStorageClient } from "@_koii/storage-task-sdk";
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
  const projectPrefix = `${getBasePath}gamedir`;

  // Ensure the folder exists
  try {
    await namespaceWrapper.fs("access", projectPrefix, 6);
  } catch (error) {
    await namespaceWrapper.fs("mkdir", projectPrefix, 6);
  }

  // Download all files that don't exist
  for (const file of files) {
    const cid = file.cid;
    const fileName = file.name;

    console.log(`Processing ${fileName}...`);
    try {
      console.log(`Checking if ${fileName} exists...`);
      await namespaceWrapper.fs("access", path.join(projectPrefix, fileName));
      console.log("File found:", fileName);
    } catch (error) {
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
        fileData = Array.from(new Uint8Array(buffer));
      }
      await namespaceWrapper.fs(
        "writeFile",
        path.join(projectPrefix, fileName),
        [fileData],
      );
      console.log(`Successfully downloaded and wrote ${fileName}`);
    }
  }

  console.log("------------------------------------------------");

  // Get Task ID and open browser
  const taskIdString = process.argv[3];
  console.log("taskID is ", taskIdString);

  if (taskIdString !== undefined) {
    console.log("Attempting to open URL");
    open(`http://localhost:30017/task/${taskIdString}/main.html`);
  }
}
