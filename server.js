const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const configuration = require('./knexfile')[process.env.NODE_ENV || 'development'];
const database = require('knex')(configuration);
const dataHelpers = require('./helpers/dataHelpers.js')(database);
const validate = require('./helpers/authHelpers.js')(database);
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const cors = require('cors');
const bodyParser = require("body-parser");
const uuid = require('uuid/v1');

const userRoute = require('./src/modules/users/routes');
// const boardRoute = require('./src/modules/board/routes');

require('dotenv').config()
require('./socket')(io);

const PORT = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

//HELPERS
function randomString(length) {
  const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += str[Math.floor(Math.random() * 62)];
  }
  return code;
}

//API ROUTES
app.use('/', userRoute);
app.use('/user', userRoute);
// app.use('/board',  boardRoute);
app.post("/newLink", function (req, res) {
  const roomData = {
    creator: req.session.username,
    time_per_move: req.body.time,
    start_color: getColor(req.body.color),
    url: randomString(10),
    current_game: null,
    games_completed: 0,
    creator_victories: 0,
  }

  //if a player selects random color, this needs to be
  //dealt with before game & room inserted into db
  function getColor(selectedColor) {
    return (selectedColor === 'r') ? ['w', 'b'][Math.floor(Math.random() * 2)] : selectedColor;
  }

  dataHelpers.newGameAndRoom(roomData).then(() => res.status(200).send(roomData.url))
});

app.get("/rooms/:id", function (req, res) {
  const roomurl = req.params.id;
  dataHelpers.getRoomData(roomurl).then(data => res.status(200).json({success:true, data:data[0]}), console.error);
})

app.get("/games/:id", function (req, res) {
  let username = req.session.username;
  const gameid = req.params.id;
  dataHelpers.getGame(gameid).then(data => {
    const gameData = data[0]
    if (data[0].white_id === null) {
      dataHelpers.addPlayerToGame('w', username, gameid, data[0]).then(res.status(200).json({success: true, data:gameData}))
    } else if (data[0].black_id === null) {
      dataHelpers.addPlayerToGame('b', username, gameid, data[0]).then(res.status(200).json({success: true, data:gameData}))
    } else {
      res.status(200).json({success: true, data: gameData})
    }
  })
})

server.listen(PORT, function () {
  console.log(`Socket server running on port ${PORT}`)
});
