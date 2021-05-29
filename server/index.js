const app = require('express')();
const http = require('http').createServer(app);
const jwt = require('jsonwebtoken');
const io = require('socket.io')(http);

const server_port = process.env.PORT || 5000;
const jwt_secret = process.env.JWT_SECRET || '3dcc17e8cf702ee00787c7086de31d';

let servers = {};

io.use((socket, next) => {
    const header = socket.handshake.headers['authorization'];
    const token = header.split(' ')[1];
    jwt.verify(token, jwt_secret, function (err) {
        if (err) return next(new Error('authentication error'));
        return next();
    });
});

io.on('connection', (socket) => {
    socket.on('create-server', ({ id, token }, cb) => {
        try {
            servers[id] = {
                admin: { id: socket.id, token },
                clients: [],
            };
            socket.join(parseInt(id));
            console.log(socket.id + ' user created-server successfully');
            cb({ status: 'success' });
        } catch (err) {
            console.error('create-server', err.message);
            cb({ status: 'error' });
        }
    });

    socket.on('connect-server', ({ id, token }, cb) => {
        try {
            if (!servers[id]) {
                return cb({
                    status: 'error',
                    msg: 'Could not connect to partner',
                });
            }

            if (servers[id]['admin']['id'] === socket.id) {
                return cb({
                    status: 'error',
                    msg: "Can't connect to self",
                });
            }

            io.to(servers[id]['admin']['id']).emit('verify-user', {
                id,
                token,
                client: socket.id,
            });

            cb({
                status: 'success',
                msg: 'Ready to connect (secure connection)',
            });
        } catch (err) {
            console.error('create-server', err.message);
            cb({ status: 'error', msg: 'Authenticating failed' });
        }
    });

    socket.on('verified-user', ({ id, client }) => {
        try {
            servers[id]['clients'].push({ [client]: true });
            io.to(client).emit('verify-join', { id, client });
        } catch (err) {
            console.error('verified-user', err.message);
        }
    });

    socket.on('join-user', ({ id, client }, cb) => {
        try {
            if (
                servers[id]['clients'].find(
                    (c) =>
                        Object.keys(c)[0] === socket.id &&
                        socket.id === client &&
                        Object.keys(c)[0]
                )
            ) {
                socket.join(id);
                cb({ status: 'success', msg: 'Connected (secure connection)' });
            }
        } catch (err) {
            console.error('join-user', err.message);
        }
    });

    socket.on('share-data', (data) => {
        try {
            data = JSON.parse(data);
            const room = data.room;
            const imgStr = data.image;

            socket.broadcast.to(parseInt(room)).emit('share-data', imgStr);
        } catch (err) {
            console.error(err.message);
        }
    });

    socket.on('disconnect', function () {
        console.log(socket.id, 'user disconnected');
        for (let key in servers) {
            if (servers[key]['admin']['id'] === socket.id) {
                for (let i = 0; i < servers[key]['clients'].length; i++) {
                    const client = servers[key]['clients'][i];
                    io.to(Object.keys(client)[0]).emit('force-disconnect', {});
                }
                delete servers[key];
            }
        }
    });
});

http.listen(server_port, () => {
    console.log('server Listening on ' + server_port);
});
