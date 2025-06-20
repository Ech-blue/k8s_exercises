// pingpong.js
const express = require('express');
const app = express();

let pongCount = 0;

app.get('/pingpong', (req, res) => {
  pongCount++;
  res.send('Pong');
});

app.get('/pings', (req, res) => {
  res.send(pongCount.toString());
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Ping Pong app listening on port ${PORT}`);
});

