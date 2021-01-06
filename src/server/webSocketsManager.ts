import { IEventInfo } from "../interfces/IEventInfo";
import { IEventsNotifier } from "../interfces/IEventsNotifier";
import { WebSocketWrapper } from "./webSocketWrapper";

export class WebSocketsManager {
    webSocketWrapper: any;
    webSocketsPool = new Map();
    bet365Socket: WebSocket;
    eventsNotifier: IEventsNotifier;
    eventWebSocketWrapper: WebSocketWrapper;
    constructor(webSocketWrapper: any, eventsNotifier: IEventsNotifier) {
        this.webSocketWrapper = webSocketWrapper;
        this.bet365Socket = webSocketWrapper._socket;
        this.eventsNotifier = eventsNotifier;
    }
    public addSocketEvent(event: any, loadLivescore: boolean) {
        // if (!event.ID.includes("95384474C1A")) {
        //     // console.log(event.ID);
        //     return;
        // }
        if (this.webSocketsPool.has(event.ID)) {
            return;
        }
        // if (this.webSocketsPool.size > 0) {
        //     return;
        // }
        try {
            const eventInfo: IEventInfo = {
                browserId: window["browserId"],
                keepAliveWebsockerUrl: this.getKeepAliveWebSocketUrl(),
                websockerUrl: this.getWebSocketUrl(),
                websockerProtocol: this.getWebSocketProtocol(),
                handshakeMesage: this.getHandshakeData(),
                id: event.ID,
                C1: event.C1,
                T1: event.T1,
                C2: event.C2,
                T2: event.T2,
                sportId: event.sportId,
                loadLivescore: loadLivescore
            };
            this.webSocketsPool.set(event.ID, eventInfo);
            this.eventsNotifier.eventAdded(eventInfo);
            console.log("browserId: " + window["browserId"]);
            // if (this.eventWebSocketWrapper == null) {
            //     this.eventWebSocketWrapper = new WebSocketWrapper(eventInfo);
            //     this.eventWebSocketWrapper.open();
            // }
        } catch (error) {
            debugger;
        }
    }
    public removeSocketEvent(event: any) {
        if (!this.webSocketsPool.has(event.ID)) {
            return;
        }
        try {
            const eventInfo: IEventInfo = {
                browserId: window["browserId"],
                id: event.ID,
                websockerUrl: null,
                websockerProtocol: null,
                handshakeMesage: null,
                C1: null,
                C2: null,
                T1: null,
                T2: null,
                sportId: null,
                loadLivescore: false,
                keepAliveWebsockerUrl: null
            };
            this.eventsNotifier.eventRemoved(eventInfo);
            this.webSocketsPool.delete(event.ID);
        } catch (error) {
            debugger;
            return;
        }
    }
    public getWebSocketUrl(): string {
        const url = this.bet365Socket.url;
        const uid = this.generateUid();
        var array = url.split("?");
        var socketUrl = `${array[0]}?uid=${uid}`;
        return socketUrl;
    }
    public getKeepAliveWebSocketUrl(): string {
        const url = "wss://pshudws.365lpodds.com/zap/";
        const uid = this.generateUid();
        var socketUrl = `${url}?uid=${uid}`;
        return socketUrl;
    }
    public getWebSocketProtocol(): string {
        return this.bet365Socket.protocol;
    }
    public getHandshakeData(): string {
        return this.webSocketWrapper.getHandshakeData();
    }
    private generateUid() {
        const minm = 100000000000000;
        const maxm = 999999999999999;
        const min = Math.random();
        const max = (maxm - minm + 1);
        const num = Math.floor(min * max) + minm;
        return num;
    }
}
