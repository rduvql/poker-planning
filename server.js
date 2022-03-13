// @ts-check

const path = require('path');

const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer, { path: "/socket" })


/** @type { { socket: socketio.Socket, name: string, choice: number }[] } */
const clients = [];



io.on("connection", (socket) => {
    console.log("client connected");

    socket.on("disconnect", () => {
        // console.log("client diconnected");
        clients.splice(clients.findIndex(c => c.socket.id === socket.id), 1);

        clients.forEach(cli => {
            cli.socket.emit("logout_user", { id: socket.id })
        })
    })

    socket.on("register_user", (name) => {
        // console.log(socket.id, name)
        clients.push({ socket, name, choice: -1 })

        clients.forEach(cli => {
            if (socket.id !== cli.socket.id) {
                cli.socket.emit("register_user", { id: socket.id, name: name })
            }
            socket.emit("register_user", { id: cli.socket.id, name: cli.name })
        })
    })

    socket.on("selected_choice", (number) => {
        // console.log(socket.id, number)

        clients.forEach(cli => {
                cli.socket.emit("selected_choice", { id: socket.id, number: number })
            })
    })

    socket.on("clear_results", () => {
        clients.forEach(cli => {
            cli.socket.emit("clear_results")
        })
    })
});



app.use(express.static(path.join(__dirname, "public/")));

httpServer.listen(8080, () => {
    console.log("listening 8080")
});
