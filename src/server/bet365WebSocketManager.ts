export class Bet365WebSocketManager {
    socket: WebSocket;
    constructor(socket: any) {
        this.socket = socket;
        var self = this;
        this.socket.onopen = function (event) {
            window.console.log("WebSocket is opened.");
            self.onSocketConnected();
        };
        this.socket.onclose = function (event) {
            window.console.log("WebSocket is closed now.");
            self.onSocketDisconnected();
        };
        this.socket.onmessage = function (event) {
            self.onMessageReceived(event.data);
        };
    }
    public isOpen(): boolean {
        return this.socket != null && this.socket.readyState === 1;
    }
    public send(message: string) {
        this.socket.send(message);
    }
    public close() {
        if (!this.isOpen())
            return;
        this.socket.close();
    }
    private onSocketConnected() {
    }
    private onSocketDisconnected() {
    }
    private onMessageReceived(message) {
    }
}
