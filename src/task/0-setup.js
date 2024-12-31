import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { KoiiStorageClient } from "@_koii/storage-task-sdk";
import path from "path";
import open from "open";

export async function setup() {
  console.log("CUSTOM SETUP");

  const client = new KoiiStorageClient();
  const projectPrefix = "gamedir";

  // Check if the file exists before downloading
  const checkAndDownloadFile = async (cid, fileName) => {
    console.log(`Processing ${fileName}...`);
    try {
      console.log(`Checking if ${fileName} exists...`);
      const accessResult = await namespaceWrapper.fs('readFile', path.join(projectPrefix, fileName));
      if (accessResult.error) {
        console.log('Downloading file ', fileName);
        const blob = await client.getFile(cid, fileName);
        let fileData;

        // Use text() for text files, arrayBuffer() for binary
        if (fileName.endsWith('.html') || fileName.endsWith('.js') || fileName.endsWith('.css')) {
          fileData = await blob.text();
        } else {
          // For .jsdos and other binary files
          const buffer = await blob.arrayBuffer();
          fileData = Array.from(new Uint8Array(buffer));
        }


        await namespaceWrapper.fs('writeFile', path.join(projectPrefix, fileName), [fileData]);
        console.log(`Successfully downloaded and wrote ${fileName}`);
      }
      console.log('File ready:', fileName);
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error);
    }
  };

  // Define files to download
  const files = [
    { cid: "bafybeidmakt2gll7skn344whg4pekslc7oekauswan7efgsu5a2yjfdy2a", name: "main.html" },
    { cid: "bafybeieik7mttaubfmsqeaofshvzwzg35ckdqlprudnq5lqzzyeiae46ki", name: "bundle.jsdos" },
    { cid: "bafybeiatydrn6mnqqf425nhnieqif2lamcqzjwlwtbndhta7e4l7vmw6pa", name: "js-dos.js" },
    { cid: "bafybeie36usyziyly3qlhkvcikmwozcz3e2btomu7pm63fw4ryf3cbn26e", name: "js-dos.css" }
  ];

  // Ensure the folder exists
  console.log('Checking folder existence...');
  try {
    const accessResult = await namespaceWrapper.fs('access', projectPrefix, 6);
    if (accessResult.error) {
      console.log('Creating folder...');
      await namespaceWrapper.fs('mkdir', projectPrefix, 6);
    }
    console.log('Folder ready:', projectPrefix);
  } catch (error) {
    console.error('Error checking folder:', error);
  }

  // Download all files that don't exist
  for (const file of files) {
    await checkAndDownloadFile(file.cid, file.name);
  }

  // Get Task ID and open browser
  const taskIdString = process.argv[3];
  console.log('taskID is ', taskIdString);

  if (taskIdString !== undefined) {
    console.log('Attempting to open URL');
    open(`http://localhost:30017/task/${taskIdString}/main.html`);
  }
}
