const http = require('http');

let counter = 0;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    counter++;
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

