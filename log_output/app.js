const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Generate UUID on startup
const startupUuid = uuidv4();

// Log UUID every 5 seconds
setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${startupUuid}`);
}, 5000);

// Keep process running
const server = http.createServer(() => {});
server.listen(8080);

