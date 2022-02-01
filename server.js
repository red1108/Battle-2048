const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const path = require("path");
const cors = require("cors");
const fs = require("fs");

app.use(cors());
app.use(express.static("build"));
app.use(express.static("static"));

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("database", (msg) => {
        console.log("database size = ", msg.length);
        for (let i = 0; i < msg.length; i++) {
            fs.appendFileSync("./model/dataset/dataset.txt", JSON.stringify(msg[i]) + "\n");
        }
    });

    socket.on("replay", (msg) => {
        console.log("replay size = ", msg.length);
        for (let i = 0; i < msg.length; i++) {
            fs.appendFileSync("./model/dataset/replay.txt", JSON.stringify(msg[i]) + "\n");
        }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("movetoserver", (roomid, uid, action, winner, row, col, val) => {
        console.log(uid);
        io.to(roomid).emit("movetoclient", uid, action, winner, row, col, val);
    });

    socket.on("roomjoin", (roomid) => {
        socket.join(roomid);
    });
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/build/index.html"));
});

http.listen(80, function () {
    console.log("listening on 80");
});
