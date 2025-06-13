const http = require('http');
const fs = require('fs');
const path = '/mnt/data/shared-log-ping/counter.txt';

let counter = 0;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    counter++;
    // Write counter to file asynchronously
    fs.writeFile(path, counter.toString(), (err) => {
      if (err) console.error('Error writing counter:', err);
    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`pong ${counter}\n`);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(8080, () => {
  console.log('Ping-Pong server started on port 8080');
});

