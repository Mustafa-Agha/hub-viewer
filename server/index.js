const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const server_port = process.env.PORT || 5000;

let rooms = {};

io.on("connection", (socket) => {
    socket.on("create-cast", ({id, password}) => {
        try {
            socket.join(id);
            rooms[id] = {
                user: socket.id,
                password: password,
            };
            console.log("user", socket.id, "created room:", id);
        } catch (err) {
            console.error(err.stack || err);
        }
    });

    socket.on("join-cast", ({id, password}) => {
        try {
            if (rooms[id] && rooms[id]['password'] === password) {
                socket.join(id);
                console.log("user", socket.id, "joined room:", id);
            }
        } catch (err) {
            console.error(err.stack || err);
        }
    });

    socket.on("screen-data", (data) => {
        try {
            data = JSON.parse(data);
            const room = data.room;
            const imgStr = data.image;

            socket.broadcast.to(room).emit('screen-data', imgStr);
        } catch (err) {
            console.error(err.stack || err);
        }
    });

    socket.on("leave-room", ({id, password}) => {
        try {
            if ((rooms[id] && rooms[id]['password'] === password)
                || (rooms[id] && rooms[id]['user'] === socket.id)) {
                socket.leave(id);
                console.log("user", socket.id, "left room:", id);
            }
        } catch (err) {
            console.error(err.stack || err);
        }
    });
});

http.listen(server_port, () => {
    console.log("server Listening on " + server_port);
});
