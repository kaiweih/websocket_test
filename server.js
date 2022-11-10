const express = require('express');
const expressWs = require('express-ws');

const app = express();
expressWs(app);

const PORT = 3001;

// default first message
const messages = [{ id: 0, text: 'Welcome!', username: 'Chat Room' }];

// store all consumers
const sockets = [];
app.use(express.json());

app.listen(3001, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/messages', (req, res) => {
  const message = req.body;
  messages.push(message);

  // send message to all consumers
  for (const socket of sockets) {
    socket.send(JSON.stringify(message));
  }
});

app.ws('/messages', (socket) => {
  sockets.push(socket);

  // remove consumer when it's closed
  socket.on('close', () => {
    sockets.splice(sockets.indexOf(socket), 1);
  });
});
