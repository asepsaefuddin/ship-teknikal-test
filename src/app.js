const express = require('express');
const serverless = require('serverless-http');

const app = express();
const shipRoutes = require('./routes/ship.routes');

app.use(express.json());
app.use('/', shipRoutes);

let clients = [];

// SSE endpoint
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  clients.push(res);

  console.log("Client connected, total:", clients.length);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    console.log("Client disconnected, total:", clients.length);
  });
});


module.exports = serverless(app);