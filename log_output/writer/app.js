// writer.js
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const startupUuid = uuidv4();
const filePath = '/data/log.txt';

function writeLog() {
  const timestamp = new Date().toISOString();
  const line = `${timestamp}: ${startupUuid}\n`;
  fs.appendFile(filePath, line, (err) => {
    if (err) console.error('Error writing log:', err);
  });
}

// Write immediately and then every 5 seconds
writeLog();
setInterval(writeLog, 5000);

