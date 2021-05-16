const app = require('express')();
const http = require('http').createServer(app);
// const jwt = require("jsonwebtoken");
const io = require('socket.io')(http);

const server_port = process.env.PORT || 5000;

let rooms = {};

io.on('connection', (socket) => {
    socket.on('create-room', ({id, password}, cb) => {
        try {
            socket.join(id);
            rooms[id] = {
                user: socket.id,
                password: password,
            };
            console.log('user', socket.id, 'created room:', id);
            cb({ status: 'success', msg: 'user ' + socket.id + 'created room: ' + id });
        } catch (err) {
            console.error(err.stack || err);
            cb({ status: 'fail', msg: err.stack || err });
        }
    });

    socket.on('connect-to-room', ({id}, cb) => {
        try {
            if (!rooms[id]) {
                return cb({ status: 'fail', msg: 'room: ' + id + ' not found' });
            }

            if (rooms[id]['user'] === socket.id) {
                return cb({ status: 'fail', msg: 'can not connect to self' });
            }

            return cb({ status: 'success', msg: 'found room: ' + id });
        } catch (err) {
            console.error(err.stack || err);
            cb({ status: 'fail', msg: err.stack || err.message || err });
        }
    });

    socket.on('auth-room', ({id, password}, cb) => {
        try {
            if (!rooms[id]) {
                return cb({ status: 'fail', msg: 'room: ' + id + ' not found' });
            }

            if (rooms[id] && rooms[id]['password'] === password) {
                socket.join(id);
                console.log('user', socket.id, 'joined room:', id);
                io.to(rooms[id]['user']).emit('share-screen', {id, password, client: socket.id});
                return cb({ status: 'success', msg: 'joined room: ' + id });
            } else {
                return cb({ status: 'fail', msg: 'room: ' + id + ' auth error' });
            }
        } catch (err) {
            console.error(err.stack || err);
            cb({ status: 'fail', msg: err.stack || err.message || err });
        }
    });

    socket.on('screen-data', (data) => {
        try {
            data = JSON.parse(data);
            const room = data.room;
            const imgStr = data.image;

            socket.broadcast.to(room).emit('screen-data', imgStr);
        } catch (err) {
            console.error(err.stack || err);
        }
    });

    socket.on('leave-room', ({ id, password }) => {
        try {
            if (
                (rooms[id] && rooms[id]['password'] === password) ||
                (rooms[id] && rooms[id]['user'] === socket.id)
            ) {
                socket.leave(id);
                console.log('user', socket.id, 'left room:', id);
            }
        } catch (err) {
            console.error(err.stack || err);
        }
    });
});

http.listen(server_port, () => {
    console.log('server Listening on ' + server_port);
});
