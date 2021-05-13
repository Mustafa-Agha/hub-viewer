const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const server_port = process.env.PORT || 5000;

app.get("/view", (req, res) => {
    res.sendFile(__dirname + '/display.html');
});

io.on("connection", (socket) => {
    socket.on("join-message", (roomId) => {
        socket.join(roomId);
        console.log("User joined in a room: " + roomId);
    });
});

http.listen(server_port, () => {
    console.log("server Listening on " + server_port);
});
