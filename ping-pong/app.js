// app.js (updated for PostgreSQL)
const express = require('express');
const { Client } = require('pg');

const app = express();

// Get DB config from environment variables
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: 5432,
});

let pongCount = 0;

// Initialize DB connection and load counter
async function init() {
  await client.connect();
  
  // Create table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS counter (
      id SERIAL PRIMARY KEY,
      count INT NOT NULL DEFAULT 0
    );
  `);

  // Ensure at least one row exists
  const result = await client.query('SELECT count FROM counter WHERE id = 1');
  if (result.rows.length === 0) {
    await client.query('INSERT INTO counter (id, count) VALUES (1, 0)');
    pongCount = 0;
  } else {
    pongCount = parseInt(result.rows[0].count);
  }

  console.log(`Counter initialized from DB: ${pongCount}`);
}

// Handle /pingpong
app.get('/pingpong', async (req, res) => {
  pongCount++;
  await client.query('UPDATE counter SET count = $1 WHERE id = 1', [pongCount]);
  res.send('Pong');
});

// Handle /pings
app.get('/pings', (req, res) => {
  res.send(pongCount.toString());
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await client.end();
  process.exit(0);
});

const PORT = process.env.PORT || 8080;
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Ping Pong app listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
