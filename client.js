const messagingApi = require('./messaging_api');
const readline = require('readline');

const displayedMessages = {};

const terminal = readline.createInterface({
  input: process.stdin,
});

terminal.on('line', (text) => {
  const username = process.env.NAME;
  // generate random id
  const id = Math.floor(Math.random() * 100000);
  displayedMessages[id] = true;
  const message = { id, text, username };
  messagingApi.sendMessages(message);
});

const displayMessage = (message) => {
  console.log(`> ${message.username}: ${message.text}`);
  displayedMessages[message.id] = true;
};

const getAndDisplayMessages = async () => {
  const messages = await messagingApi.getMessages();
  for (const message of messages) {
    const messageAlreadyDisplayed = message.id in displayedMessages;
    if (!messageAlreadyDisplayed) displayMessage(message);
  }
};

const pollMessages = () => {
  setInterval(getAndDisplayMessages, 3000);
};

const streamMessages = () => {
  const messagingSocket = messagingApi.createMessagingSocket();
  messagingSocket.on('message', (data) => {
    const message = JSON.parse(data);
    const messageAlreadyDisplayed = message.id in displayedMessages;
    if (!messageAlreadyDisplayed) displayMessage(message);
  });
};

if (process.env.MODE === 'poll') {
  // get all existing messages first
  getAndDisplayMessages();
  // start display new messages
  pollMessages();
} else if (process.env.MODE === 'stream') {
  getAndDisplayMessages();
  streamMessages();
}
