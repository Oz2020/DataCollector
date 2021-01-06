abstract class Bet365WebSocketBase {

    url: string;
    protocol: string;
    websocket: WebSocket;
    messagesCount = 0;
    isClosedManualy = false;

    constructor() {
    }

    public open() {
        this.url = this.getWebSocketUrl();
        this.protocol = this.getWebSocketProtocol();

        if (this.url === undefined || this.url.length === 0) {
            throw new Error("url is null or empty");
        }

        if (this.protocol && this.protocol.length > 0) {
            this.websocket = new WebSocket(this.url, this.protocol);
        } else {
            this.websocket = new WebSocket(this.url);
        }

        this.registerWebSocketEvents();
    }

    public close() {
        this.isClosedManualy = true;
        this.websocket.close();
    }

    public send(message: string) {
        this.websocket.send(message);
    }

    public isConnected(): boolean {
        return this.websocket && this.websocket.readyState === WebSocket.OPEN;
    }

    protected abstract getWebSocketUrl(): string;

    protected getWebSocketProtocol(): string {
        return null;
    }

    protected registerWebSocketEvents() {
        var self = this;

        this.websocket.onopen = function (event) {
            try {
                self.messagesCount = 0;
                self.onSocketOpened(event);
            } catch (error) {
                self.logError(`[Socket:onopen] - ${error.message}`);
            }
        };

        this.websocket.onclose = function (event) {
            try {
                self.onSocketClosed(event);
                if (!self.isClosedManualy) {
                    setTimeout(() => {
                        self.open();
                    }, 1);
                }
            } catch (error) {
                self.logError(`[Socket:onclose] - ${error.message}`);
            }
        };

        this.websocket.onmessage = function (event) {
            try {
                self.onSocketMessgae(event.data);
            } catch (error) {
                self.logError(`[Socket:onmessage] - ${error.message}`);
            }
        };

        this.websocket.onerror = function (event) {
            try {
                self.onSocketError(event);
            } catch (error) {
                self.logError(`[Socket:onerror] - ${error.message}`);
            }
        };
    }

    protected getCurrentTime(): string {
        var d = new Date();
        var dformat = [
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
        ].join(':');

        return dformat;
    }

    protected onSocketOpened(event: any) {
    }

    protected onSocketClosed(event: any) {
    }

    protected onSocketMessgae(message: string) {
    }

    protected onSocketError(event: any) {
        debugger;
    }

    protected logError(errorMessage) {
    }
}
