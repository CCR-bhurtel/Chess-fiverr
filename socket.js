const uuid = require('uuid/v1');
const configuration = require('./knexfile')[process.env.NODE_ENV || 'development'];
const database = require('knex')(configuration);
const dataHelpers = require('./helpers/dataHelpers.js')(database);

function socketInit(io) {

    function NumClientsInRoom(namespace, room) {
        var clientsInRoom = io.nsps['/'].adapter.rooms[room];
        return clientsInRoom === undefined ? 0 : Object.keys(clientsInRoom.sockets).length;
    }

    io.on('connection', function (socket) {

        let room;

        socket.on('joinRoom', function (data) {
            const username = data.username;
            room = data.room;

            if (NumClientsInRoom('/', room) < 2) {
                socket.join(room);
                console.log(`${username} joined room ${room}`);
                io.to(room).emit(`roomFull`, false);
            }
            io.to(room).send({ count: NumClientsInRoom('/', room), message: `${username} connected!` });


            //When two players are in the room, the link box must disappear
            if (NumClientsInRoom('/', room) == 2) {
                io.to(room).emit(`roomFull`, true);
            }

            socket.emit("me", socket.id)
        })

        socket.on("move", function (data) {
            socket.to(room).emit('move', data);

            let gameData = data.state.gameData;
            let username = data.username;
            let gameObj = data.game;
            let move = data.lastMove.from + data.lastMove.to;

            dataHelpers.addMove(gameData.id, move).then(console.log, console.error)
        })

        //Listen for checkmate event (event comes from loser)
        socket.on("checkmate", function (data) {
            if (data.gameData) {
                let gameData = data.gameData;
                let username = data.username;
                let winner = ''
                data.color === 'w' ? winner = 'b' : winner = 'w';
                let roomid = data.roomData.id;
                let loserUsername = data.username;
                let roomCreator = data.roomData.creator;
                dataHelpers.endGame(gameData.id, winner).then(() => {
                    dataHelpers.upDataRoomVictories(roomid, loserUsername, roomCreator).then(() => {
                        gameOverUpdate(data);
                    })
                })
            }
        })

        socket.on("resign", function (data) {
            io.to(room).emit(`resign`);
        })

        function gameOverUpdate(data) {
            let roomData = {}
            console.log('data.roomData:::::::::::::::', data.roomData);
            dataHelpers.getRoomData(data.roomData.url)
                .then(res => roomData = res[0])
                .then(dataHelpers.getGame(data.gameData.id)
                    .then(res => sendUpdateData(roomData, res[0])))
        }

        function sendUpdateData(roomData, gameData) {
            console.log('roomData:::::;roomData::::::::::::', roomData);
            let white_username = '';
            let black_username = '';
            dataHelpers.getUsername(gameData.white_id).then(res => {
                white_username = res[0]
                dataHelpers.getUsername(gameData.black_id).then(res => {
                    black_username = res[0]
                }).then(() => {
                    io.to(room).emit("gameOver", { roomData, gameData, white_username, black_username })
                })
            })

        }

        //Hande rematchRequest event
        socket.on("rematchRequest", function (data) {
            console.log("rematchRequest received")
            console.log(data)
            let roomId = data.roomData.id;
            let url = data.roomData.url
            let oldWhiteId = data.gameData.white_id;
            let oldBlackId = data.gameData.black_id;
            console.log('rematch data:::::::::::::::::::::;', data);

            dataHelpers.newGameReturningId({ white_id: oldBlackId, black_id: oldWhiteId })
                .then(res => { dataHelpers.updateCurrentGameInRoom(roomId, res[0]) })
                .then(() => { io.to(room).emit('startRematch', url) })


        })

        socket.on('chat', function (data, callback) {
            const message = {
                content: data.content,
                id: uuid()
            }
            if (callback) {
                callback(message);
            }
            socket.to(room).emit('msg', message)
        })

        socket.on("disconnect", () => {
            socket.to(room).emit("callEnded")
        })

        socket.on("callUser", (data) => {
            socket.to(room).emit(`callUser`, { signal: data.signalData, from: data.from, name: data.name });
            //io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
        })

        socket.on("answerCall", (data) => {
            io.to(data.to).emit("callAccepted", data.signal)
        })
    });
}
module.exports = socketInit;