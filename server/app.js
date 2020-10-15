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
let rooms = [];
const playerData = [];

// random ID generator
const IDgen = () => {
  let dupe = false;
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

  rooms.push(id);
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

    for (let i = 0; i < playerData.length; i++) {
      if (room === playerData[i].room_id) {
        nameData.push(playerData[i].nickname);
        scoreData.push(playerData[i].score);
      }
    }

    io.to(room).emit('update-scoreboard', nameData, scoreData);
  };

  // hosting a room
  socket.on('create', (nick) => {
    const room = IDgen();
    const json = {
      socket_id: socket.id,
      room_id: room,
      nickname: nick,
      score: 0,
    };
    socket.join(room);
    playerData.push(json);
    updateScoreboard(room);
    io.to(room).emit('room-id', room);
  });

  // joining a room
  socket.on('join', (nick, room) => {
    const json = {
      socket_id: socket.id,
      room_id: room,
      nickname: nick,
      score: 0,
    };
    let doesExist = false;
    let players = 0;

    // make sure the room exists
    for (let i = 0; i < rooms.length; i++) {
      if (room === rooms[i]) {
        doesExist = true;
        break;
      }
    }

    // check if the room is full or not
    for (let i = 0; i < playerData.length; i++) {
      if (room === playerData[i].room_id) players++;

      if (players === 10) break;
    }

    if (doesExist && players < 10) {
      socket.join(room);
      playerData.push(json);
      io.to(socket.id).emit('join-success');
      updateScoreboard(room);
    } else if (!doesExist) io.to(socket.id).emit('error', 'Invalid room code. Please try again.');
    else if (players <= 10) io.to(socket.id).emit('error', 'Room is full! Please try again later.');
    else io.to(socket.id).emit('error', 'Something went wrong. Please try again.');
  });

  // changing a nickname
  socket.on('nick', (nick) => {
    console.log(nick);
  });

  // disconnecting
  socket.on('disconnect', () => {
    let room = '';
    let empty = false;

    // loop through playerData to delete disconnected player
    for (let i = 0; i < playerData.length; i++) {
      if (socket.id === playerData[i].socket_id) {
        room = playerData[i].room_id;
        playerData.splice(i, 1);
        break;
      }
    }

    // if playerData is empty, then rooms should
    // be emptied out as well
    // otherwise, check if there's anyone in the room or not
    if (playerData.length !== 0) {
      for (let i = 0; i < playerData.length; i++) {
        if (room === playerData[i].room_id) break;
        else empty = true;
      }
    } else rooms = [];

    // remove empty room from rooms array
    if (empty) rooms.splice(rooms.indexOf(room), 1);
  });
});

http.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on port ${port}`);
});
