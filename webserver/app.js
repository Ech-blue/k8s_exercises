const http = require('http');
const fs = require('fs');
const https = require('https');
const path = require('path');

const CACHE_DIR = '/caching';
const IMAGE_PATH = path.join(CACHE_DIR, 'image.jpg');
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REDIRECTS = 5;

const html = `
  <html>
    <head>
      <title>The project App</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { width: 700px; margin: 40px auto; }
        .main-title { font-size: 2.5em; font-weight: bold; margin-bottom: 30px; }
        .image-block { display: flex; flex-direction: column; align-items: center; }
        .caption { margin-top: 20px; font-size: 1.2em; }
        img { max-width: 100%; height: auto; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="main-title">The project App</div>
        <div class="image-block">
          <img src="/image" alt="Random" />
          <div class="caption">DevOps with Kubernetes 2025</div>
        </div>
      </div>
    </body>
  </html>
`;

// Fetch image with redirect support
function fetchAndCacheImage(callback, url = 'https://picsum.photos/1200', redirects = 0) {
  if (redirects > MAX_REDIRECTS) {
    callback(new Error('Too many redirects'));
    return;
  }

  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      // Follow redirect
      fetchAndCacheImage(callback, res.headers.location, redirects + 1);
      return;
    }

    if (res.statusCode !== 200) {
      callback(new Error(`Failed to fetch image, status code: ${res.statusCode}`));
      return;
    }

    fs.mkdir(CACHE_DIR, { recursive: true }, (err) => {
      if (err) {
        callback(err);
        return;
      }

      const fileStream = fs.createWriteStream(IMAGE_PATH);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(callback);
      });
      fileStream.on('error', (err) => {
        callback(err);
      });
    });
  }).on('error', (err) => {
    callback(err);
  });
}

// Get age of cached image in milliseconds
function getCachedImageAge() {
  try {
    const stats = fs.statSync(IMAGE_PATH);
    return Date.now() - stats.mtimeMs;
  } catch {
    return Infinity; // File does not exist
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve HTML page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);

  } else if (req.method === 'GET' && req.url === '/image') {
    // Check image age
    const age = getCachedImageAge();

    if (age > CACHE_DURATION_MS) {
      // Image too old or missing, fetch new image before serving
      fetchAndCacheImage((err) => {
        if (err) {
          console.error('Error fetching image:', err);
          res.writeHead(500);
          res.end('Error fetching image');
          return;
        }
        serveImage(res);
      });
    } else {
      // Serve cached image
      serveImage(res);
    }

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function serveImage(res) {
  fs.stat(IMAGE_PATH, (err, stats) => {
    if (err) {
      res.writeHead(404);
      res.end('Image not found');
      return;
    }

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=600'); // 10 minutes
    res.setHeader('Last-Modified', stats.mtime.toUTCString());

    // Handle conditional GET
    const ifModifiedSince = res.req.headers['if-modified-since'];
    if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
      res.writeHead(304);
      res.end();
      return;
    }

    const stream = fs.createReadStream(IMAGE_PATH);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    stream.pipe(res);
  });
}

// Fetch image on startup so first request is fast
fetchAndCacheImage((err) => {
  if (err) {
    console.error('Initial image fetch failed:', err);
  } else {
    console.log('Initial image fetched and cached');
  }
});

server.listen(8080, () => {
  console.log('Server started on port 8080');
});

