const http = require('http')
const path = require('path')
const socketIo = require('socket.io');
const express = require('express');
const { createServerField, checkWinConditions, checkFieldExist } = require('./game-field/field.js');
const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);
const CONSTANTS = require('./client/scripts/multiplayer/constants.js');

app.use(express.static(path.join(__dirname, `./client`)));



const ioServer = socketIo(httpServer);

const randomRoom = () => {
    return Math.floor(Math.random() * 100);
}



ioServer.on('connection', async (socket) => {
    
    socket.on('access-room', async (roomId) => {
        if (!roomId) {
            const room = randomRoom().toString();
            socket.join(room);
            socket.data.room = room;
            socket.data.type = CONSTANTS.SERVER.PLAYER_TYPE.HOST
            socket.data.score = 0
            return sendNoOpponentMsg(room);

        } else {
            if (!ioServer.of('/').adapter.rooms.get(roomId)) return sendNoRoomFound(socket);
            socket.join(roomId);

            if (ioServer.of('/').adapter.rooms.get(roomId).size == 2) {
                socket.data.room = roomId;
                socket.data.type = CONSTANTS.SERVER.PLAYER_TYPE.OPPONENT;
                socket.data.score = 0;

                //Save two players to each other's data obj to use them for scoring later
                const sockets = await ioServer.in(socket.data.room).fetchSockets();
                let hostSocket;
                let guestSocket;
                sockets.forEach(socket => {
                    if (socket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.HOST) hostSocket = socket;
                    if (socket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.OPPONENT) guestSocket = socket;
                })

                hostSocket.data.enemy = guestSocket;
                guestSocket.data.enemy = hostSocket;

                ioServer.in(roomId).emit('message', ({
                    type: CONSTANTS.SERVER.MESSAGE.READY_TO_START

                }))

            } else if (ioServer.of('/').adapter.rooms.get(roomId).size > 2) {
                socket.leave(roomId);
                socket.join(`${roomId} obs`);
                socket.data.room = roomId;
                socket.data.type = CONSTANTS.SERVER.PLAYER_TYPE.OBSERVER
                ioServer.to(socket.id).emit('message', {
                    type: CONSTANTS.SERVER.MESSAGE.OBSERVER_NEW_CONNECTION,

                })
            }

        }
    })


    // Chat logic

    socket.on('message-chat', (msg) => {
        if (!socket) return;
        socket.to(socket.data.room).emit('message-chat', ({
            type: CONSTANTS.CLIENT.MESSAGE.NEW_MESSAGE,
            payload: {
                nickname: 'Opponent',
                body: msg.payload,
                time: returnTime()
            }
        }))
    })

    // Generation event
    socket.on('generate', () => {
        if (!socket) return;
        // if (!socket.data.enemy?.connected) return sendNoOpponentMsg(socket.data.room);
        const field = createServerField(socket.data.room);
        if (socket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.OBSERVER) return ioServer.to(socket.id).emit('field-return', field);
        ioServer.to(socket.data.room).to(`${socket.data.room} obs`).emit('field-return', field);
    })

    // Communicating moves and checking win conditions

    socket.on('move', (move) => {
        if (!socket) return;

        const currentSocket = socket;
        const opponentSocket = currentSocket.data.enemy;

        if (currentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.OBSERVER) return;

        const { x, y } = move;

        if (!opponentSocket.connected) return sendNoOpponentMsg(currentSocket.data.room);
        if (!checkFieldExist(currentSocket.data.room)) return;
        const [msg, isFinished, isWinner] = checkWinConditions(x, y, currentSocket.data.room);


        if (!isFinished) {
            socket.to(socket.data.room).emit('move', ({
                type: CONSTANTS.SERVER.PLAYER_TYPE.PLAYER,
                payload: move
            }));
            ioServer.in(`${currentSocket.data.room} obs`).emit('move', ({
                type: CONSTANTS.SERVER.PLAYER_TYPE.OBSERVER,
                payload: {
                    p1Pos: currentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.HOST ? move : null,
                    p2Pos: currentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.OPPONENT ? move : null,
                }
            }))
            return;
        }
        if (isWinner) {
            currentSocket.data.score++
            ioServer.to(currentSocket.id).emit('message', ({
                type: CONSTANTS.SERVER.MESSAGE.ROUND_WON,
                payload: {
                    notice: 'You ' + msg,
                    score: currentSocket.data.score,
                    enemyScore: opponentSocket.data.score
                }
            }))
            ioServer.to(opponentSocket.id).emit('message', ({
                type: CONSTANTS.SERVER.MESSAGE.ROUND_LOST,
                payload: {
                    notice: 'You\'re so slow, the opponent beats you this time',
                    enemyScore: currentSocket.data.score,
                    score: opponentSocket.data.score
                }
            }))
            ioServer.in(`${currentSocket.data.room} obs`).emit('message', ({
                type: CONSTANTS.SERVER.MESSAGE.OBSERVER_UPDATE_GAME,
                payload: {
                    notice: 'Round ended. Waiting for restart',
                    score: currentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.HOST ? currentSocket.data.score : opponentSocket.data.score,
                    enemyScore: opponentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.OPPONENT ? opponentSocket.data.score : currentSocket.data.score,
                }
            }))
            return
        }

        if (isFinished) {
            opponentSocket.data.score++;
            ioServer.to(currentSocket.id).emit('message', ({
                type: CONSTANTS.SERVER.MESSAGE.ROUND_LOST,
                payload: {
                    notice: 'You are ' + msg,
                    score: currentSocket.data.score,
                    enemyScore: opponentSocket.data.score

                }
            }))
            ioServer.to(opponentSocket.id).emit('message', ({
                type: CONSTANTS.SERVER.MESSAGE.ROUND_WON,
                payload: {
                    notice: 'You\'re lucky, your opponent is so clumsy, so this time the round is yours',
                    score: opponentSocket.data.score,
                    enemyScore: currentSocket.data.score

                }
            }))
            ioServer.in(`${currentSocket.data.room} obs`).emit('message', ({
                type: CONSTANTS.SERVER.MESSAGE.OBSERVER_UPDATE_GAME,
                payload: {
                    notice: 'Round ended. Waiting for restart',
                    score: currentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.HOST ? currentSocket.data.score : opponentSocket.data.score,
                    enemyScore: opponentSocket.data.type === CONSTANTS.SERVER.PLAYER_TYPE.OPPONENT ? opponentSocket.data.score : currentSocket.data.score,
                }
            }))
        }



    })

    //Close connection

    socket.on('disconnect', (reason) => {
        ioServer.in(socket.data.room).emit('message', ({
            type: CONSTANTS.SERVER.MESSAGE.OPPONENT_LEFT,
            payload: `Your opponent has left the game`
        }))

        ioServer.in(socket.data.room).disconnectSockets();
    })
})


httpServer.listen(PORT, () => {
    console.log('Server is online')
})


// Helper

const sendNoOpponentMsg = (room) => {
    ioServer.in(room).emit('message', ({
        type: CONSTANTS.SERVER.MESSAGE.WAITING_FOR_USER,
        payload: 'Waiting for an opponent',
        room
    }))
    sendObserverRoomDeleted(room);
}

const sendNoRoomFound = (socket) => {
    ioServer.to(socket.id).emit('message', ({
        type: CONSTANTS.SERVER.MESSAGE.NO_ROOM_FOUND,
        payload: 'This room doesn\'t exist anymore'
    }))
}

const sendObserverRoomDeleted = (room) => {
    ioServer.in(`${room} obs`).emit('message', ({
        type: CONSTANTS.SERVER.MESSAGE.OBSERVER_UPDATE_GAME,
        payload: { notice: 'Room no longer exists' }
    }))
}

const returnTime = () => {
    return `${new Date().getHours()}:${('0' + new Date().getMinutes()).slice(-2)}`
}