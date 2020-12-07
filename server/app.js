// import libraries
const path = require('path');
const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const favicon = require('serve-favicon');
const compression = require('compression');
const expressHandlebars = require('express-handlebars');

// set port and require router
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const router = require('./router.js');

// networking management
const playerData = {
  // Template Structure
  /*
    roomid: {
        hasStarted: false,
        roomSecret: ??????????,
        socketid: {
            nickname: nick,
            score: 0,
        },
        socketid: {
            nickname: nick,
            score: 0,
        },...
    },
  */
};

// random ID generator
const IDgen = () => {
  let dupe = false;
  const rooms = Object.keys(playerData);
  let id = Math.random().toString(36).substr(2, 6);
  // this generates a random value, converts to letters and numbers,
  // then gets the first 6 values after the decimal point

  // check for duplicates and reroll if necessary
  do {
    for (let i = 0; i < rooms.length; i++) {
      if (id === rooms[i]) {
        dupe = true;
        id = Math.random().toString(36).substr(2, 6);
        break;
      }
    }
  } while (dupe);

  return id;
};

// setup express page
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.webp`));
app.disable('x-powered-by');
app.use(compression());
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

router(app);

// networking via socket.io!
io.on('connection', (socket) => {
  // helper functions
  const createScoreboard = (room) => {
    const nameData = [];
    const scoreData = [];
    const returnData = [];
    const keys = [...Object.keys(playerData[room])];

    // remove hasStarted and roomSecret
    keys.splice(0, 2);

    // place name and score data into respective arrays
    for (let i = 0; i < keys.length; i++) {
      nameData.push(playerData[room][keys[i]].nickname);
      scoreData.push(playerData[room][keys[i]].score);
    }

    returnData.push(nameData);
    returnData.push(scoreData);

    io.to(room).emit('create-scoreboard', returnData);
  };

  const stripSpecialChars = (str) => str.replace(/[^\w\s]/gi, '').toLowerCase();

  // Dice.js one-liners
  socket.on('setup-multi', (rand) => { io.to(socket.id).emit('setup-multi-true', rand); });
  socket.on('match-roll', (room, currRollArr) => { io.to(room).emit('return-match-roll', currRollArr); });
  socket.on('select-multi', (room, dieId, num) => { io.to(room).emit('return-select-multi', dieId, num); });

  // Game.js one-liners
  socket.on('roll', (room) => { io.to(room).emit('return-roll'); });
  socket.on('end-turn', (room) => { io.to(room).emit('return-end-turn'); });
  socket.on('restart', (room) => { io.to(room).emit('return-restart'); });

  // Main.js one-liners
  socket.on('increment-players', (room) => {
    const players = (playerData[room]) ? (Object.keys(playerData[room]).length - 2) : -1;

    io.to(room).emit('update-players', players);
  });

  // hosting a room
  socket.on('create', (nick) => {
    const room = IDgen();
    const secret = Math.random().toString(36).substr(2, 10);
    // creates a random id similar to IDgen but longer for the room secret
    // which is used for encrypting/decrypting messages within a room

    // create two new json objects to hold data
    const playerInfo = {};

    // initialize pd[room] as a blank object and initialize hasStarted
    playerData[room] = {};
    playerData[room].hasStarted = false;
    playerData[room].roomSecret = secret;

    playerInfo.nickname = nick;
    playerInfo.score = 0;

    // join room and push data to pd[room]
    socket.join(room);
    playerData[room][socket.id] = playerInfo;
    createScoreboard(room);
    io.to(room).emit('room-id', room, secret);
  });

  // joining a room
  socket.on('join', (nick, room) => {
    const playerInfo = {};
    let doesExist = false;
    let nameDupe = false;
    const playerIds = (playerData[room]) ? [...Object.keys(playerData[room])] : [];

    // remove hasStarted and roomSecret from playerIds
    if (playerIds.length !== 0) playerIds.splice(0, 2);

    // fill json with data
    playerInfo.nickname = nick;
    playerInfo.score = 0;

    // make sure the room exists
    if (playerIds.length !== 0) doesExist = true;

    if (doesExist) {
      for (let i = 0; i < playerIds.length; i++) {
        const currNick = playerData[room][playerIds[i]].nickname;
        if (stripSpecialChars(nick) === stripSpecialChars(currNick)) nameDupe = true;
      }
    }

    if (doesExist && !nameDupe && playerIds.length < 10 && !playerData[room].hasStarted) {
      socket.join(room);
      playerData[room][socket.id] = playerInfo;
      io.to(socket.id).emit('join-success', playerIds.length, room, playerData[room].roomSecret);
      createScoreboard(room);
    } else if (!doesExist) io.to(socket.id).emit('error', 'Invalid room code. Please try again.');
    else if (nameDupe) io.to(socket.id).emit('error', 'Name is taken. Please enter another name.');
    else if (playerIds.length >= 10) io.to(socket.id).emit('error', 'Room is full! Please try again later.');
    else if (playerData[room].hasStarted) io.to(socket.id).emit('error', 'Game has already started.');
    else io.to(socket.id).emit('error', 'Something went wrong. Please try again.');
  });

  // start game
  socket.on('start', (room) => { playerData[room].hasStarted = true; io.to(room).emit('start-game'); });

  // sync scores between all clients in room
  socket.on('send-score', (room, newScore, player) => {
    const keys = [...Object.keys(playerData[room])];
    keys.splice(0, 2); // remove hasStarted and roomSecret

    playerData[room][keys[player]].score = newScore;
    io.to(room).emit('receive-score', newScore, player);
  });

  // disconnecting
  socket.on('disconnect', () => {
    let room = '';
    let empty = false;
    const rooms = Object.keys(playerData);

    // delete disconnected player's data
    for (let i = 0; i < rooms.length; i++) {
      if (playerData[rooms[i]][socket.id]) {
        delete playerData[rooms[i]][socket.id];

        // check if room is empty
        if (playerData[rooms[i]].length === 0) {
          room = rooms[i];
          empty = true;
        }
      }
    }

    // delete room if empty
    if (!empty && room !== '') createScoreboard(room);
    else if (empty) delete playerData[room];
  });

  // chat message
  socket.on('send-chat', (room, msg) => {
    const nick = (playerData[room][socket.id]) ? playerData[room][socket.id].nickname : '???';
    io.to(room).emit('receive-chat', msg, nick);
  });
});

http.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on port ${port}`);
});
