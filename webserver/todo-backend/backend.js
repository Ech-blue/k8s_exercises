const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { todo } = req.body;
  if (todo && typeof todo === 'string' && todo.length <= 140) {
    todos.push(todo);
    res.status(201).json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid todo' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`todo-backend running on port ${PORT}`);
});

