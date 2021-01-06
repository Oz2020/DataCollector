import { IEventInfo } from "../interfces/IEventInfo";
import { ISocketCloseError } from "../interfces/ISocketCloseError";
import { IWebsocketNotifications } from "../interfces/IWebsocketNotifications";
import { WebSocketWrapper } from "./webSocketWrapper";

enum MessageType {
    Handshake = "Handshake",
    Time = "Time",
    Delete = "Delete",
    Insert = "Insert",
    Update = "Update",
    EventsList = "EventsList",
    Config = "Config",
    InPlayOverview = "InPlayOverview",
    LivescoreDataSnapshot = "LivescoreDataSnapshot",
    FullEventSnapshot = "FullEventSnapshot"
}

export class EventManager implements IWebsocketNotifications {

    event: IEventInfo;
    loadLivescore: boolean;    
    eventsSocket: WebSocketWrapper;
    eventsSocketBackup: WebSocketWrapper;

    messageSplitter = String.fromCharCode(8);
    messageSuffix = String.fromCharCode(15);
    pathSplitter = String.fromCharCode(1)

    constructor(event: IEventInfo) {
        this.event = event;
        this.loadLivescore = event.loadLivescore;

        this.eventsSocket = new WebSocketWrapper("eventsSocket", this.event.websockerUrl, this.event.websockerProtocol, this, false);
        this.eventsSocketBackup = new WebSocketWrapper("eventsSocketBackup",this.event.websockerUrl, this.event.websockerProtocol, this, false);
    }

    public onSocketOpened(socketWrapper: WebSocketWrapper) {
        console.warn(`[${socketWrapper.name}] ${this.event.id} Started at: ${socketWrapper.getCurrentTime()}`);
        this.sendHandshake(socketWrapper);
    }

    public onSocketClosed(socketWrapper: WebSocketWrapper, error: ISocketCloseError) {
        console.warn(`[${socketWrapper.name}] ${this.event.id} closed at: ${socketWrapper.getCurrentTime()}`);
        this.open();
    }

    private getMessageType(message: string): MessageType {
        if (message.startsWith("100")) {
            return MessageType.Handshake;
        }

        if (message.startsWith("__time")) {
            return MessageType.Time;
        }

        const configPrefix = "CONFIG_1_3";
        if (message.startsWith(configPrefix)) {
            return MessageType.Config;
        }

        let prefix = "OVInPlay_1_3";
        if (message.startsWith(prefix)) {
            return MessageType.InPlayOverview;
        }

        let last = message.split(this.pathSplitter).reverse()[0];

        if (last.startsWith("F|EV")) {
            return MessageType.FullEventSnapshot;
        }

        if (last.startsWith("U|")) {
            return MessageType.Update;
        }

        if (last.startsWith("D|")) {
            return MessageType.Delete;
        }

        if (last.startsWith("I|")) {
            return MessageType.Insert;
        }

        return MessageType.Update
    }

    private cleanMessage(message: string): string {
        const cleanChars = [14, 20, 21];

        cleanChars.forEach(c => {
            var index = message.indexOf(String.fromCharCode(c));
            if (index != -1) {
                message = message.substring(index + 1);
            }
        });

        return message
    }

    private handleMessage(socketWrapper: WebSocketWrapper, origMessage: string) {
        const message = this.cleanMessage(origMessage);
        const messageType = this.getMessageType(message);
        switch (messageType) {
            case MessageType.Handshake:
                {
                    const values = message.split(String.fromCharCode(2));
                    if (values[0] === "100") { // Success
                        const connectionId = values[1];
                        this.sendConfig(socketWrapper);
                    } else {
                        //Error in handshake
                    }
                    break;
                }
            case MessageType.Time:
                {
                    break;
                }
            case MessageType.Config:
                {
                    this.subscribe(socketWrapper);
                    // this.startKeepAlive();
                    this.validateDataReceived(socketWrapper);
                    break;
                }
            case MessageType.FullEventSnapshot:
                {
                    console.log(`[${socketWrapper.name}](${socketWrapper.messagesCount})[${socketWrapper.getCurrentTime()}][${this.event.id}][${messageType}][${message.substring(0, 10)}]`);
                    break;
                }
            case MessageType.EventsList:
                {
                    console.log(`[${socketWrapper.name}](${socketWrapper.messagesCount})[${socketWrapper.getCurrentTime()}][${this.event.id}][${messageType}][${message.substring(0, 10)}]`);
                    break;
                }

            case MessageType.InPlayOverview:
                {
                    break;
                }
            case MessageType.Delete:
            case MessageType.Insert:
            case MessageType.Update:
                {
                    console.log(`[${socketWrapper.name}](${socketWrapper.messagesCount})[${socketWrapper.getCurrentTime()}][${this.event.id}][${messageType}][${message.substring(0, 10)}]`);
                    break;
                }
            case MessageType.LivescoreDataSnapshot:
                {
                    break;
                }

            default:
                break;
        }
    }

    public onSocketMessgae(socketWrapper: WebSocketWrapper, message: string) {
        this.handleMessage(socketWrapper, message);
    }

    public onSocketError(socketWrapper: WebSocketWrapper, error: string) {
        console.log(`[${socketWrapper.name}] - Error on socket for id: ${this.event.id} ${error}`);
    }

    public open() {
        this.eventsSocket?.open({
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-WebSocket-Extensions": "permessage-deflate; server_no_context_takeover; client_max_window_bits=15",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
        });
        // setTimeout(() => {
        //     this.eventsSocketBackup?.open({
        //         "Accept-Language": "en-US,en;q=0.9",
        //         "Sec-WebSocket-Extensions": "permessage-deflate; server_no_context_takeover; client_max_window_bits=15",
        //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
        //     });
        // }, 10000);

        // this.keepAliveSocket?.open({
        //     "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
        //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
        // });
    }

    public close() {
        this.eventsSocket?.close();
        // this.eventsSocketBackup?.close();
    }

    tempSubscriptions = [];

    public subscribeEvent(eventInfo: IEventInfo) {
        // console.log(`subscribe to event ${eventInfo.id}`);
        // var eventIdArray = eventInfo.id.split("_");
        // var eventId = `${eventIdArray[0]}_1_1`;
        // const subscriptionMessage = `6V${eventId}`;

        // this.tempSubscriptions.push(subscriptionMessage);

        // if(this.eventsSocket.isOpen()) {
        //     this.tempSubscriptions.forEach(s => {
        //         this.eventsSocket.send(s);
        //     });

        //     this.tempSubscriptions = [];
        // }
    }

    private sendHandshake(socketWrapper: WebSocketWrapper) {
        if (socketWrapper.isOpen()) {
            const handshakeData = this.getHandshakeData();
            console.log(`[${socketWrapper.name}] - Socket for id: ${this.event.id} sending handshake: ${handshakeData}`);
            socketWrapper.send(handshakeData);
        } else {
            setTimeout(() => {
                this.sendHandshake(socketWrapper);
            }, 1000);
        }
    }

    private getHandshakeData(): string {
        return this.event.handshakeMesage;
    }

    private getSubscriptionMessage(): string {
        var eventIdArray = this.event.id.split("_");
        var eventId = `${eventIdArray[0]}_1_1`;
        return `\x16\x006V${eventId}\x01`;
    }

    private getLivescoreSubscriptionMessgae(): string {
        return `${this.event.C1}${this.event.T1}${this.event.C2}${this.event.T2}M${this.event.sportId}_1`;
    }

    private sendConfig(socketWrapper: WebSocketWrapper) {
        socketWrapper.send(`\x16\x00CONFIG_1_3,RPB3371_1_3,OVInPlay_1_3\x01`);
        // socketWrapper.send(`\x16\x00CONFIG_1_3\x01`);
    }

    private subscribe(socketWrapper: WebSocketWrapper) {
        console.log(`subscribe to ${this.event.id}`);        

        const subscriptionMessage = this.getSubscriptionMessage();
        socketWrapper.send(subscriptionMessage);

        if (this.loadLivescore) {
            const subscriptionText = this.getLivescoreSubscriptionMessgae();
            socketWrapper.send(subscriptionText);
        }
        //this.sendKeepAlive();            
    }

    private validateDataReceived(socketWrapper: WebSocketWrapper) {
        setTimeout(() => {
            const now = new Date();
            const diff = Math.abs(now.getTime() - socketWrapper.lastMessageTime.getTime()) / 1000;
            if(diff > 15) {
                console.warn(`[${socketWrapper.name}] - no message for 15 seconds. restarting socket...`);
                this.close();
            } else {
                this.validateDataReceived(socketWrapper);
            }
        }, 5000);
    }

    // private startKeepAlive() {
    //     setTimeout(() => {

    //         if (this.eventsSocket.isOpen()) {
    //             this.subscribe(this.eventsSocket);
    //             this.startKeepAlive();
    //         } else {
    //             debugger
    //         }
            
    //     }, 15000);
    // }
}
