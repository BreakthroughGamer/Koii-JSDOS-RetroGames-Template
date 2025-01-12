import { namespaceWrapper, app, TASK_ID } from "@_koii/namespace-wrapper";
import path from "path";

export function routes() {
  const gameDirPath = "gamedir";

  // API Routes - Define these BEFORE the static file handler
  app.post(`/init-game`, async (req, res) => {
    try {
      await namespaceWrapper.storeSet("gameState", "waiting");
      await namespaceWrapper.storeSet("currentGameScore", 0);
      await namespaceWrapper.storeSet("lastScoreUpdate", Date.now());
      console.log("Game initialized successfully");
      res.status(200).send("Game initialized");
    } catch (error) {
      console.error("Error initializing game:", error);
      res.status(500).send("Error initializing game");
    }
  });

  app.post(`/submit-score`, async (req, res) => {
    try {
      console.log("Received score submission:", req.body);
      const { score, timestamp, gameState } = req.body;
      
      // Validate score
      if (typeof score !== 'number' || score <= 0) {
        console.log("Invalid score received:", score);
        return res.status(400).send("Invalid score");
      }

      // Validate timestamp
      const currentTime = Date.now();
      const maxTimeOffset = 5 * 60 * 1000; // 5 minutes
      if (Math.abs(currentTime - timestamp) > maxTimeOffset) {
        console.log("Invalid timestamp:", timestamp);
        return res.status(400).send("Invalid timestamp");
      }

      // Store game state and score
      await namespaceWrapper.storeSet("gameState", gameState);
      await namespaceWrapper.storeSet("currentGameScore", score);
      await namespaceWrapper.storeSet("lastScoreUpdate", timestamp);
      
      console.log(`Score submitted: ${score}, Game State: ${gameState}`);
      res.status(200).send("Score submitted successfully");
    } catch (error) {
      console.error("Error submitting score:", error);
      res.status(500).send("Error submitting score");
    }
  });

  // Serve all static files
  app.get('/*', async (req, res) => {
    try {
      // Log all incoming requests
      console.log('Incoming request for:', req.url);
      
      // Remove any query parameters for file lookup
      const filename = (req.params[0] || 'main.html').split('?')[0];
      console.log('Looking for file:', filename);
      
      const filePath = path.join(gameDirPath, filename);
      console.log('Full file path:', filePath);

      // Check if file exists first
      try {
        await namespaceWrapper.fs('access', filePath);
        console.log(`${filename} exists locally, serving from disk`);
      } catch (err) {
        console.log(`${filename} not found locally, need to download`);
        return res.status(404).send("File not found - needs download");
      }

      // If we get here, file exists locally
      const file = await namespaceWrapper.fs('readFile', filePath);
      console.log('File read successfully, type:', typeof file);
      
      const buffer = Buffer.from(Array.isArray(file) ? file : 
                    typeof file === 'object' ? file.data : file);

      // Set content type and cache control headers
      if (filename.endsWith('.css')) {
        console.log('Serving CSS file');
        res.setHeader('Content-Type', 'text/css');
      } else if (filename.endsWith('.js')) {
        console.log('Serving JS file');
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filename.endsWith('.jsdos')) {
        console.log('Serving JSDOS file:', filename);
        console.log('JSDOS file size:', buffer.length);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
      } else if (filename.endsWith('.html')) {
        console.log('Serving HTML file');
        // Modify the HTML content to add timestamp to .jsdos URL
        if (filename === 'main.html') {
          const htmlString = buffer.toString('utf8');
          const timestamp = Date.now();
          const modifiedHtml = htmlString.replace(
            'url: "./bundle.jsdos"',
            `url: "./bundle.jsdos?v=${timestamp}"`
          );
          console.log('Modified HTML with timestamp:', timestamp);
          return res.send(modifiedHtml);
        }
        res.setHeader('Content-Type', 'text/html');
      }

      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (error) {
      console.error(`Error serving ${req.params[0]}:`, error);
      console.error('Full error:', error);
      res.status(404).send("File not found");
    }
  });
}
