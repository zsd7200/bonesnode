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
        socketid: {
            nickname: nick,
            score: 0,
        },
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
  const updateScoreboard = (room) => {
    const nameData = [];
    const scoreData = [];
    const returnData = [];
    const keys = Object.keys(playerData[room]);

    // place name and score data into respective arrays
    for (let i = 0; i < keys.length; i++) {
      nameData.push(playerData[room][keys[i]].nickname);
      scoreData.push(playerData[room][keys[i]].score);
    }

    returnData.push(nameData);
    returnData.push(scoreData);

    io.to(room).emit('update-scoreboard', returnData);
  };

  // Dice.js one-liners
  socket.on('setup-multi', (rand) => { io.to(socket.id).emit('setup-multi-true', rand); });
  socket.on('match-roll', (room, currRollArr) => { io.to(room).emit('return-match-roll', currRollArr); });
  socket.on('select-multi', (room, dieId, num) => { io.to(room).emit('return-select-multi', dieId, num); });

  // Game.js one-liners
  socket.on('roll', (room) => { io.to(room).emit('return-roll'); });
  socket.on('end-turn', (room) => { io.to(room).emit('return-end-turn'); });
  socket.on('restart', (room) => { io.to(room).emit('return-restart'); });

  // hosting a room
  socket.on('create', (nick) => {
    const room = IDgen();

    // create two new json objects to hold data
    const playerInfo = {};

    // initialize pd[room] as a blank array
    playerData[room] = {};

    playerInfo.nickname = nick;
    playerInfo.score = 0;

    // join room and push data to pd[room]
    socket.join(room);
    playerData[room][socket.id] = playerInfo;
    updateScoreboard(room);
    io.to(room).emit('room-id', room);
  });

  // joining a room
  socket.on('join', (nick, room) => {
    const playerInfo = {};
    const rooms = Object.keys(playerData);
    let doesExist = false;
    const players = Object.keys(playerData[room]).length;

    // fill json with data
    playerInfo.nickname = nick;
    playerInfo.score = 0;

    // make sure the room exists
    for (let i = 0; i < rooms.length; i++) {
      if (room === rooms[i]) {
        doesExist = true;
        break;
      }
    }

    if (doesExist && players < 10) {
      socket.join(room);
      playerData[room][socket.id] = playerInfo;
      io.to(socket.id).emit('join-success', players);
      updateScoreboard(room);
    } else if (!doesExist) io.to(socket.id).emit('error', 'Invalid room code. Please try again.');
    else if (players >= 10) io.to(socket.id).emit('error', 'Room is full! Please try again later.');
    else io.to(socket.id).emit('error', 'Something went wrong. Please try again.');
  });

  // start game
  socket.on('start', (room) => { io.to(room).emit('start-game'); });

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
    if (!empty && room !== '') updateScoreboard(room);
    else if (empty) delete playerData[room];
  });
});

http.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on port ${port}`);
});
