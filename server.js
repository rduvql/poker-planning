// @ts-check

const path = require('path');
const process = require('process');

const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer, { path: "/socket" })


/** @type { { socket: socketio.Socket, name: string, choice: number }[] } */
let clients = [];

const getClientDto = () => {
    return clients.map(c => ({ id: c.socket.id, name: c.name, choice: c.choice }))
}


io.on("connection", (socket) => {
    console.log("client connected", socket.id);

    socket.emit("notify", getClientDto())
    
    socket.on("disconnect", () => {
        console.log("disconnect", socket.id);
        clients.splice(clients.findIndex(c => c.socket.id === socket.id), 1);

        clients.forEach(cli => {
            cli.socket.emit("notify", getClientDto())
        })
    })

    socket.on("register_user", (name) => {
        console.log("register_user", socket.id, name)

        clients.push({ socket, name, choice: -1 })
        clients.forEach(cli => {
            cli.socket.emit("notify", getClientDto())
        })
    })

    socket.on("selected_choice", (number) => {
        console.log("selected_choice", socket.id, number)

        let user = clients.find(u => u.socket.id === socket.id)
        if (user) {
            user.choice = number;
        }
        clients.forEach(cli => {
            cli.socket.emit("notify", getClientDto())
        })
    })

    socket.on("clear_results", () => {
        clients = clients.map(c => ({ socket: c.socket, name: c.name, choice: -1 }));
        clients.forEach(cli => {
            cli.socket.emit("notify", getClientDto());
        })
    })

    socket.on("reveal", () => {
        clients.forEach(cli => {
            cli.socket.emit("reveal")
        })
    })

    socket.on("hide", () => {
        clients.forEach(cli => {
            cli.socket.emit("hide")
        })
    })
});



app.use(express.static(path.join(__dirname, "public/")));

httpServer.listen(process.env.PORT, () => {
    console.log(`listening ${process.env.PORT}`)
});
