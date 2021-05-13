const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const server_port = process.env.PORT || 5000;

let rooms = {};

io.on("connection", (socket) => {
    socket.on("create-cast", ({id, password}) => {
        socket.join(id);
        rooms[id] = {
            user: socket.id,
            password: password,
        };
        console.log("user", socket.id, "created room:", id);
    });

    socket.on("join-cast", ({id, password}) => {
        if (rooms[id] && rooms[id]['password'] === password) {
            socket.join(id);
            console.log("user", socket.id, "joined room:", id);
        }
    });

    socket.on("screen-data", (data) => {
        data = JSON.parse(data);
        const room = data.room;
        const imgStr = data.image;

        socket.broadcast.to(room).emit('screen-data', imgStr);
    });

    socket.on("leave-room", ({id, password}) => {
        if ((rooms[id] && rooms[id]['password'] === password)
            || (rooms[id] && rooms[id]['user'] === socket.id)) {
            socket.leave(id);
            console.log("user", socket.id, "left room:", id);
        }
    });
});

http.listen(server_port, () => {
    console.log("server Listening on " + server_port);
});
