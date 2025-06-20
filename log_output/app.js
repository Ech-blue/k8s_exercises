const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');  // Import uuid
const app = express();

const PINGPONG_SERVICE_URL = process.env.PINGPONG_SERVICE_URL || 'http://ping-pong-svc:8080';

app.get('/log', async (req, res) => {
  try {
    const response = await axios.get(`${PINGPONG_SERVICE_URL}/pings`);
    const pongCount = response.data;

    // Generate timestamp and UUID
    const timestamp = new Date().toISOString();
    const uuid = uuidv4();

    const logEntry = `${timestamp}: ${uuid} - Ping / Pongs: ${pongCount}`;
    console.log(logEntry);

    res.send(logEntry);
  } catch (error) {
    console.error('Error fetching pong count:', error.message);
    res.status(500).send('Error fetching pong count');
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Log Output app listening on port ${PORT}`);
});

