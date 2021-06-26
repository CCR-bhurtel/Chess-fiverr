var express = require('express')
const { login, register } = require('../services')

var router = express.Router()


router.post("/newLink", cors(corsOptions), function (req, res) {
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
  function getColor(selectedColor){
    return (selectedColor === 'r') ? ['w','b'][Math.floor(Math.random() * 2)] : selectedColor;
  }

  dataHelpers.newGameAndRoom(roomData).then(() => res.status(200).send(roomData.url))
});

router.get("/rooms/:id", cors(corsOptions), function(req, res) {
  const roomurl = req.params.id;
  dataHelpers.getRoomData(roomurl).then( data => res.status(200).send(data[0]), console.error);
})

router.get("/games/:id", cors(corsOptions), function(req, res) {
  let username = req.session.username;
  const gameid = req.params.id;
  dataHelpers.getGame(gameid).then( data => {
    const gameData = data[0]
    if (data[0].white_id === null) {
      dataHelpers.addPlayerToGame('w', username, gameid, data[0]).then(res.status(200).send(gameData))
    } else if (data[0].black_id === null) {
      dataHelpers.addPlayerToGame('b', username, gameid, data[0]).then(res.status(200).send(gameData))
    } else {
      res.status(200).send(gameData)
    }
  })
})


module.exports = router;