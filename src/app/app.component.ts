import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    socket = io({ path: "/socket" })

    chosenComplexity = -1;

    complexities = [1, 2, 3, 5, 8, 13];

    connectedUsers: { id: string, name: string, number: number }[] = [];

    ngOnInit(): void {

        let [, name] = document.URL.match(/.*\?(.*)/) || [undefined, undefined];

        if (name) {
            name = name.split("=")[1]

            this.socket.on("connect", () => {
                this.socket.emit("register_user", name)
            })

            this.socket.on("register_user", (payload: { id: string, name: string }) => {
                // console.log("joined", payload)
                this.connectedUsers.push({ id: payload.id, name: payload.name, number: -1 })
            })

            this.socket.on("logout_user", (payload: { id: string }) => {
                // console.log("leave", payload)
                this.connectedUsers.splice(this.connectedUsers.findIndex(c => c.id === payload.id), 1)
            })

            this.socket.on("selected_choice", (payload: { id: string, number: number }) => {
                // console.log("choice", payload)
                let user = this.connectedUsers.find(u => u.id === payload.id)
                if (user) {
                    user.number = payload.number;
                }
            })

            this.socket.on("clear_results", () => {
                this.chosenComplexity = -1;
                this.connectedUsers.forEach(user => {
                    user.number = -1
                })
            })
        }

    }

    chooseComplexity(event, complexity: number): void {
        this.socket.emit("selected_choice", complexity)
        this.chosenComplexity = complexity;
    }

    clearResults(): void {
        this.socket.emit("clear_results")
    }

    getVal(complexity: number) {

        if (this.connectedUsers.every(c => c.number > 0)) {
            return this.connectedUsers.filter(c => c.number === complexity).length;
        }
        return 0;
    }

    getVoters(complexity: number) {

        if (this.connectedUsers.every(c => c.number > 0)) {
            return this.connectedUsers
                .filter(c => c.number === complexity)
                .map(c => c.name)
        }
        return []
    }

}
