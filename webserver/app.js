const http = require('http');

const port = process.env.PORT || 3000;

const html = `
  <html>
    <head><title>Todo App</title></head>
    <body>
      <h1>Welcome to the Todo App</h1>
      <p>This is a simple web server responding to GET /</p>
    </body>
  </html>
`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server started in port ${port}`);
});

