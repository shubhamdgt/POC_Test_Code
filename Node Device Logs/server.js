const express = require('express');
const path = require('path');
const fs = require('fs');
require('./deviceMonitor'); // start monitoring in background

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/devices', (req, res) => {
  const logPath = path.join(__dirname, 'logs', 'device_log.json');

  try {
    const data = fs.readFileSync(logPath, 'utf-8');

    if (!data) {
      return res.status(200).json([]); // or handle empty file case gracefully
    }

    const parsed = JSON.parse(data);
    res.json(parsed);
  } catch (err) {
    console.error('Error reading or parsing device_log.json:', err.message);
    res.status(500).json({ error: 'Failed to read device log data.' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
