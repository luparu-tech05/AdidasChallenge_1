const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'API server running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
