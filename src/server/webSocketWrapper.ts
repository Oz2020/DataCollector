import { IWebsocketNotifications } from "../interfces/IWebsocketNotifications";

const WebSocketClient = require('ws');

export class WebSocketWrapper {

    name: string;
    notifications: IWebsocketNotifications;
    url: string;
    protocol: string;
    websocket = null;
    messagesCount = 0;
    isClosedManualy = false;
    ignoreIncomingMessages: boolean;
    connection = null;
    startTime: Date;
    endTime: Date;
    lastMessageTime: Date;

    constructor(
        name: string,
        url: string,
        protocol: string,
        notifications: IWebsocketNotifications,
        ignoreIncomingMessages: boolean) {

        if (url === undefined || url.length === 0) {
            throw new Error("url is null or empty");
        }

        this.name = name;
        this.url = url;
        this.protocol = protocol;
        this.notifications = notifications;
        this.ignoreIncomingMessages = ignoreIncomingMessages;
    }

    public open(headers) {
        if (this.isOpen()) {
            return;
        }

        this.websocket = new WebSocketClient(
            this.url,
            [this.protocol],
            {
                origin: 'https://www.bet365.com',
                headers: headers
            });

        this.websocket._binaryType = "blob";
        this.registerWebSocketEvents();
    }

    public close() {
        this.isClosedManualy = true;
        this.websocket.close();
    }

    public isOpen(): boolean {
        return this.websocket != null && this.websocket.readyState === 1;
    }

    public send(message) {
        this.websocket.send(message);
    }

    protected registerWebSocketEvents() {
        var self = this;

        this.websocket.on('error', function open(error) {
            self.endTime = new Date();
            self.notifications.onSocketClosed(self, {
                closeDescription: error?.message,
                closeReasonCode: error?.message
            });
        });

        this.websocket.on('open', function open() {
            self.messagesCount = 0;
            self.startTime = new Date();
            self.endTime = null;
            self.notifications.onSocketOpened(self);
        });

        this.websocket.on('close', function close() {
            self.endTime = new Date();
            self.notifications.onSocketClosed(self, {
                closeDescription: "",
                closeReasonCode: ""
            });
        });

        this.websocket.on('message', function incoming(data) {
            self.lastMessageTime = new Date();
            self.messagesCount++;
            self.notifications.onSocketMessgae(self, data);
        });
    }

    public getCurrentTime(): string {
        var d = new Date();
        var dformat = [
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
        ].join(':');

        return dformat;
    }

    protected logError(errorMessage) {
    }
}
