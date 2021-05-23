const app = require('express')();
const http = require('http').createServer(app);
const jwt = require("jsonwebtoken");
const io = require('socket.io')(http);

const server_port = process.env.PORT || 5000;
const jwt_secret = process.env.JWT_SECRET || '2e8bf84eb85b8c62cb26ca36feab31ce772da90fdf98b4f5ab22f7be12a939ea';

let rooms = {};

io.use((socket, next) => {
    const header = socket.handshake.headers['authorization'];
    const token = header.split(' ')[1];
    jwt.verify(token, jwt_secret, function(err) {
        if (err) return next(new Error('authentication error'));
        return next();
    });
});

io.on('connection', (socket) => {
    socket.on('create-room', ({id, password}, cb) => {
        try {
            socket.join(parseInt(id));
            rooms[id] = {
                user: socket.id,
                password: password,
                clients: [],
            };
            console.log('user', socket.id, 'created room:', id);
            cb({ status: 'success', msg: 'user ' + socket.id + ' created room: ' + id });
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

    socket.on('auth-confirm', ({id, password}, cb) => {
        try {
            if (!rooms[id]) {
                return cb({ status: 'fail', msg: 'room: ' + id + ' not found' });
            }
            io.to(rooms[id]['user']).emit('auth-user', {id, password, client: socket.id});
            rooms[id]['clients'].push({[socket.id]: false});
            return cb({
                status: 'success',
                msg: 'user ' + socket.id + ' requesting authentication to join room: ' + id,
            });
        } catch (err) {
            console.error(err.stack || err);
            cb({ status: 'fail', msg: err.stack || err.message || err });
        }
    });

    socket.on('user-authorized', ({id, client, isAuth}, cb) => {
        try {
            if (!isAuth) return cb({ status: 'fail', msg: 'room: ' + id + ' auth error' });
            rooms[id]['clients'].forEach(clnt => {
                if (Object.keys(clnt)[0] === client) {
                    clnt[Object.keys(clnt)[0]] = isAuth;
                }
            });
            return cb({ status: 'success', msg: 'request is authorized to join room: ' + id });
        } catch (err) {
            console.error(err.stack || err);
            cb({ status: 'fail', msg: err.stack || err.message || err });
        }
    });

    socket.on('join', ({id}, cb) => {
        if (rooms[id]['clients'].find(clnt => Object.keys(clnt)[0] === socket.id)
            && rooms[id]['clients'].find(clnt => Object.keys(clnt)[0] === socket.id)[socket.id]) {
            socket.join(parseInt(id));
            return cb(true);
        }
        return cb(false);
    });

    socket.on('screen-data', (data) => {
        try {
            data = JSON.parse(data);
            const room = data.room;
            const imgStr = data.image;

            socket.broadcast.to(parseInt(room)).emit('screen-data', imgStr);
        } catch (err) {
            console.error(err.stack || err);
        }
    });
});

http.listen(server_port, () => {
    console.log('server Listening on ' + server_port);
});
