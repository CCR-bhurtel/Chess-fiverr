let express = require('express')
let  authUser = require('../../../common/middleware/auth')
const jwt = require("jsonwebtoken");

const { login, register, getUser, createLink, getLinkDetails } = require('../services')

let router = express.Router()

function randomString(length) {
  const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += str[Math.floor(Math.random() * 62)];
  }
  return code;
}

router.get('/auth', authUser, function (req, res) {
  getUser(req.user.email).then((user) => res.status(200).json({success: true, data: user})).catch((e) => res.status(400).json({success: false, message: e.message}));
})

router.post("/login", function (req, res) {
  function sendError(e) {
    res.status(400).json({ success: false, data: {}, message: e.message })
  }
  function createToken(user) {
    const token = jwt.sign({ name: user.username, email: user.email }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, data: { user: { name: user.username }, token } });
  }
  if (req.body.email && req.body.password) {
    login(req.body.email, req.body.password).then(createToken, sendError)
  }
});

router.post("/register", function (req, res) {
  function sendError(e) {
    res.status(400).json({ success: false, data: {}, message: e.message })
  }
  function createToken(values) {
    const token = jwt.sign({ name: req.body.username, email: req.body.email }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, data: { user: { name: req.body.username }, token } });
  }
  if (req.body.username && req.body.password && req.body.email) {
    register(req.body.username, req.body.password, req.body.email).then(createToken, sendError)
  } else {
    res.status(400).send('invalid parameters')
  }
});

router.post("/new-link", authUser, function (req, res) {
  const roomData = {
    creator: req.user.email,
    email: req.user.email,
    time_per_move: req.body.time,
    start_color: getColor(req.body.color),
    url: randomString(10),
    current_game: null,
    games_completed: 0,
    creator_victories: 0,
  }

  function getColor(selectedColor) {
    return (selectedColor === 'r') ? ['w', 'b'][Math.floor(Math.random() * 2)] : selectedColor;
  }
  createLink(roomData).then(() => res.status(200).json({success:true, data: roomData.url})).catch((e)=>res.status(400).json({success: false, message: e.message || 'something went wrong please try again!'}))
});

router.get("/link", authUser, function (req, res) {
  if(!req.query.url){
    res.status(400).send({success: false, message:'invalid url'})
  }
  getLinkDetails(req.query.url).then((data) => res.status(200).json({success:true, data})).catch((e)=>res.status(400).json({success: false, message: e.message || 'something went wrong please try again!'}))
});


module.exports = router;