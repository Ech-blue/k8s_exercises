const http = require('http');
const { v4: uuidv4 } = require('uuid');

const startupUuid = uuidv4();

setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${startupUuid}`);
}, 5000);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Server UUID: ${startupUuid}\n`);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(8080, () => {
  console.log('Server started in port 8080');
});

