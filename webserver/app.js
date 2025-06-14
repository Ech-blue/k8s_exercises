const http = require('http');
const fs = require('fs');
const https = require('https');
const path = require('path');

const CACHE_DIR = '/caching';
const IMAGE_PATH = path.join(CACHE_DIR, 'image.jpg');
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REDIRECTS = 5;

// Hardcoded to-do list for demonstration
const todos = [
  "Learn JavaScript",
  "Learn React",
  "Build a project",
  "Explore Kubernetes"
];

// Generate the HTML content with the to-do input, button, and list
const html = `
  <html>
    <head>
      <title>The project App</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; }
        .container { width: 700px; max-width: 90%; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 40px; }
        .main-title { font-size: 2.5em; font-weight: bold; margin-bottom: 30px; text-align: center; color: #333; }
        .image-block { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
        .caption { margin-top: 20px; font-size: 1.2em; color: #555; }
        img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        /* To-do app specific styles */
        .todo-section { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        .todo-input-container { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
        .todo-input { flex-grow: 1; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 1em; }
        .todo-input:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); }
        .todo-send-button { padding: 12px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; transition: background-color 0.3s ease; }
        .todo-send-button:hover { background-color: #0056b3; }
        .todo-send-button:disabled { background-color: #cccccc; cursor: not-allowed; }
        .todo-list ul { list-style: disc; padding-left: 20px; margin: 0; }
        .todo-list li { padding: 8px 0; border-bottom: 1px dashed #eee; color: #444; }
        .todo-list li:last-child { border-bottom: none; }
        .char-count { font-size: 0.9em; color: #666; margin-left: 10px; }
        .error-message { color: red; font-size: 0.9em; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="main-title">The project App</div>
        <div class="image-block">
          <img src="/image" alt="Random" />
          <div class="caption">DevOps with Kubernetes 2025</div>
        </div>

        <div class="todo-section">
          <h2>To-Do List</h2>
          <div class="todo-input-container">
            <input type="text" id="todoInput" class="todo-input" placeholder="Add a new todo (max 140 chars)" maxlength="140">
            <button id="sendTodo" class="todo-send-button" disabled>Send</button>
            <span id="charCount" class="char-count">0/140</span>
          </div>
          <div id="todoError" class="error-message"></div>
          <div class="todo-list">
            <ul>
              ${todos.map(todo => `<li>${todo}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <script>
        const todoInput = document.getElementById('todoInput');
        const sendButton = document.getElementById('sendTodo');
        const charCount = document.getElementById('charCount');
        const todoError = document.getElementById('todoError');
        const maxChars = 140;

        // Function to update character count and button state
        function updateTodoInputState() {
          const currentLength = todoInput.value.length;
          charCount.textContent = \`\${currentLength}/\${maxChars}\`;

          if (currentLength > maxChars) {
            todoError.textContent = 'Todo is too long!';
            sendButton.disabled = true;
            charCount.style.color = 'red';
          } else if (currentLength === 0) {
            todoError.textContent = '';
            sendButton.disabled = true;
            charCount.style.color = '#666';
          } else {
            todoError.textContent = '';
            sendButton.disabled = false;
            charCount.style.color = '#666';
          }
        }

        // Add event listener for input changes
        todoInput.addEventListener('input', updateTodoInputState);

        // Initial state update on page load
        updateTodoInputState();

        // Optional: Add a placeholder for future send functionality
        sendButton.addEventListener('click', () => {
          const todoText = todoInput.value;
          if (todoText.length > 0 && todoText.length <= maxChars) {
            console.log("Sending todo:", todoText);
            // In a real application, you would send this to a backend
            // For now, we'll just clear the input and disable the button
            todoInput.value = '';
            updateTodoInputState(); // Reset state after sending
            // You might want to dynamically add the new todo to the list here
          }
        });
      </script>
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
  } catch (error) {
    // console.error("Error getting cached image age:", error); // For debugging
    return Infinity; // File does not exist or error reading stats
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

// Ensure CACHE_DIR exists on startup
fs.mkdir(CACHE_DIR, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating cache directory:', err);
  } else {
    // Fetch image on startup so first request is fast
    fetchAndCacheImage((err) => {
      if (err) {
        console.error('Initial image fetch failed:', err);
      } else {
        console.log('Initial image fetched and cached');
      }
    });
  }
});

server.listen(8080, () => {
  console.log('Server started on port 8080');
});

