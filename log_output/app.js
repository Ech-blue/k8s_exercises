const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises; // Use promises API for async/await file I/O

const app = express();

const PINGPONG_SERVICE_URL = process.env.PINGPONG_SERVICE_URL || 'http://ping-pong-svc:8080';
// Path where the ConfigMap is mounted in your Pod (adjust if different)
const CONFIG_FILE_PATH = '/etc/config/information.txt';

app.get('/', (req, res) => {
  res.send('Log Output app running. Use the /log endpoint to see the logs.');
});

app.get('/log', async (req, res) => {
  try {
    // Fetch pong count from external service
    const response = await axios.get(`${PINGPONG_SERVICE_URL}/pings`);
    const pongCount = response.data;

    // Read ConfigMap file content
    let configFileContent = '';
    try {
      configFileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    } catch (err) {
      configFileContent = 'Could not read config file or file does not exist.';
    }

    // Read MESSAGE environment variable
    const message = process.env.MESSAGE || 'No MESSAGE env var set';

    // Generate timestamp and UUID
    const timestamp = new Date().toISOString();
    const uuid = uuidv4();

    // Construct the full log entry including config file content, env MESSAGE, timestamp, uuid, pong count
    const logEntry = `
Config file content:
${configFileContent.trim()}

Env MESSAGE:
${message}

${timestamp}: ${uuid} - Ping / Pongs: ${pongCount}
    `;

    console.log(logEntry);

    res.send(logEntry);
  } catch (error) {
    console.error('Error fetching pong count:', error.message);
    res.status(500).send(`Error fetching pong count: ${error.message}`);
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Log Output app listening on port ${PORT}`);
});

