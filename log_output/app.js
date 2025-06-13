const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const startupUuid = uuidv4();
const counterFilePath = '/mnt/data/shared-log-ping/counter.txt';

setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${startupUuid}`);
}, 5000);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(counterFilePath, 'utf8', (err, data) => {
      const counter = err ? 'N/A' : data.trim();
      const timestamp = new Date().toISOString();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Server UUID: ${startupUuid}\nTimestamp: ${timestamp}\nPing / Pongs: ${counter}\n`);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(8080, () => {
  console.log('Server started in port 8080');
});

