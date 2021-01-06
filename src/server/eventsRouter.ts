import { Utils } from "../common/utils";
import { ICommandInfo } from "../interfces/ICommandInfo";
import { IConnectionEntry } from "../interfces/IConnectionEntry";
import { IEventInfo } from "../interfces/IEventInfo";
import { IEventsRouter, ISocketListener } from "../interfces/IEventsRouter";

var WebSocketServer = require('websocket').server;
var http = require('http');

export class EventsRouter implements IEventsRouter {

    id: string;
    server: any;
    clients = new Map();
    wsServer: any;
    socketListener: ISocketListener;

    constructor() {
        this.id = Utils.generateGuid();
    }

    public getId(): string {
        return this.id;
    }

    public start(websocketPort: number) {
        this.createWebsocketServer(websocketPort);
    }

    public stop() {
        try {
            this.server.close();
            this.wsServer.close();
        } catch (error) {
            // TODO:: write to log
        }
    }

    public listenForMessages(socketListener: ISocketListener) {
        this.socketListener = socketListener;
    }

    queuedMessages: ICommandInfo[] = [];
    public send(message: ICommandInfo) {
        if (this.clients.size === 0) {
            this.queuedMessages.push(message);
            return;
        }
        const self = this;
        this.clients.forEach(function (value: IConnectionEntry, key: string, map) {
            try {
                const jsonMessage = JSON.stringify(message);
                const size = self.lengthInUtf8Bytes(jsonMessage);
                if(size > 50000) {
                    debugger
                }
                value.instance.send(jsonMessage);
            } catch (error) {
                debugger
            }
        });
    }


    private lengthInUtf8Bytes(str): number {
        // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    }

    private createWebsocketServer(websocketPort: number) {
        this.server = http.createServer(function (request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        this.server.listen(websocketPort, function () {
            console.log((new Date()) + ' Server is listening on port 8080');
        });

        this.wsServer = new WebSocketServer({
            httpServer: this.server,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
            autoAcceptConnections: false
        });

        var self = this;

        this.wsServer.on('request', function (request) {
            if (!self.originIsAllowed(request.origin)) {
                // Make sure we only accept requests from an allowed origin
                request.reject();
                console.log(`[${new Date()}] Connection from origin ${request.origin} rejected.`);
                return;
            }

            var connection = request.accept('', request.origin);
            self.addConnection(request.key, connection);

            console.log(`[${new Date()}] Connection from ${request.origin} accepted.`);

            connection.on('message', function (message) {
                switch (message.type) {
                    case 'utf8': {
                        self.onSocketMessgae(connection, message.utf8Data);
                        break;
                    }
                    default: {
                        console.log(`Received Message of type ${message.type} - lenght: ${message.binaryData.length} bytes.`);
                        break;
                    }
                }
            });

            connection.on('close', function (reasonCode, description) {
                self.onSocketClosed(reasonCode, description, connection.remoteAddress);

                self.removeConnection(request.key);
            });
        });
    }

    private onSocketClosed(reasonCode, description, remoteAddress) {
        console.log(`[${new Date()}] - Peer ${remoteAddress} disconnected. - reason: ${reasonCode} - description: ${description}`);
    }

    private onSocketMessgae(connection: any, message: string) {
        const commandInfo = JSON.parse(message) as ICommandInfo;
        if (commandInfo == undefined) {
            // TODO:: add to error log or monitor
            return;
        }

        const connectionEntry = this.getConnectionEntry(connection.key);
        if (connectionEntry == null) {
            // TODO:: add to log 
            debugger
            return;
        }

        switch (commandInfo.command) {
            case "addEvent": {
                this.addEvent(JSON.parse(commandInfo.payload));
                break;
            }
            case "removeEvent": {
                this.removeEvent(JSON.parse(commandInfo.payload));
                break
            }
            case "eventInfo": {
                this.handleEventData(JSON.parse(commandInfo.payload));
                break
            }
            case "eventDataInfo": {
                this.handleEventData(JSON.parse(commandInfo.payload));
                break
            }
            default:
                break;
        }
    }

    private originIsAllowed(origin: string) {
        const isValid = origin && origin.toLowerCase().includes('bet365');
        return isValid;
    }

    private getConnectionEntry(connectionId: string): IConnectionEntry {
        if (!this.clients.has(connectionId)) {
            return null;
        }

        return this.clients.get(connectionId) as IConnectionEntry;
    }

    private addConnection(connectionId: string, connection: any) {
        if (this.clients.has(connectionId)) {
            return;
        }

        try {
            connection.key = connectionId;
            const connectionEntry: IConnectionEntry = {
                id: connection.key,
                instance: connection,
                eventManagers: []
            };
            this.clients.set(connectionId, connectionEntry);
            if (this.queuedMessages.length > 0) {
                this.queuedMessages.forEach(commandInfo => {
                    this.send(commandInfo);
                });

                this.queuedMessages = [];
            }
        } catch (error) {
            //TODO:: write error to log and monitor
            debugger
        }
    }

    private removeConnection(connectionId: string) {
        const connectionEntry = this.getConnectionEntry(connectionId);
        if (connectionEntry == null) return;

        try {
            this.clients.delete(connectionId);

            if (connectionEntry.eventManagers) {
                connectionEntry.eventManagers.forEach(eventManager => {
                    try {
                        // eventManager.close();
                    } catch (error) {
                        //TODO:: write error to log and monitor
                        debugger
                    }
                });
            }
        } catch (error) {
            //TODO:: write error to log and monitor
            debugger
        }
    }

    private addEvent(eventInfo: IEventInfo) {
        try {
            if (eventInfo == undefined) {
                // TODO:: add to error log or monitor
                return;
            }

            if (this.socketListener?.isMessageValid(eventInfo)) {
                this.socketListener?.eventAdded(eventInfo);
            }
        } catch (error) {
            debugger;
        }
    }

    private removeEvent(eventInfo: IEventInfo) {
        try {
            if (eventInfo == undefined) {
                // TODO:: add to error log or monitor
                return;
            }

            if (this.socketListener?.isMessageValid(eventInfo)) {
                this.socketListener?.eventRemoved(eventInfo);
            }
        } catch (error) {
            debugger;
        }
    }

    private handleEventData(eventInfo: IEventDataInfo) {
        try {
            if (eventInfo == undefined) {
                // TODO:: add to error log or monitor
                return;
            }

            this.socketListener?.handleEventData(eventInfo);
        } catch (error) {
            debugger;
        }
    }
}