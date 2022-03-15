import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    socket?: Socket;

    chosenComplexity = -1;

    complexities = [1, 2, 3, 5, 8, 13];

    connectedUsers: { id: string, name: string, choice: number }[] = [];

    isRevealed = false;

    constructor() {
    }

    ngOnInit(): void {

        let [, name] = document.URL.match(/.*\?(.*)/) || [undefined, undefined];

        if (name) {
            name = name.split("=")[1]

            this.socket = io({ path: "/socket", autoConnect: false });

            this.socket?.on("notify", (payload: { id: string, name: string, choice: number }[]) => {
                this.connectedUsers = payload;
            })

            this.socket?.on("connect", () => {
                this.socket?.emit("register_user", name)
            })

            this.socket?.on("reveal", () => {
                this.isRevealed = true;
            })

            this.socket?.on("hide", () => {
                this.isRevealed = false;
            })

            this.socket?.connect();
        }

    }

    doRevealAll() {
        this.socket?.emit("reveal");
    }

    doHideAll() {
        this.socket?.emit("hide");
    }
    
    chooseComplexity(event, complexity: number): void {
        this.socket?.emit("selected_choice", complexity)
        this.chosenComplexity = complexity;
    }

    clearResults(): void {
        this.socket?.emit("clear_results")
    }


    getVal(complexity: number) {

        if (this.isRevealed || this.connectedUsers.every(c => c.choice > 0)) {
            return this.connectedUsers.filter(c => c.choice === complexity).length;
        }
        return 0;
    }

    getVoters(complexity: number) {

        if (this.isRevealed || this.connectedUsers.every(c => c.choice > 0)) {
            
            return this.connectedUsers
                .filter(c => c.choice === complexity)
                .map(c => c.name)
            
        }
        return []
    }

}
