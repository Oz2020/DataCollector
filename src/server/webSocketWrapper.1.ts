// class WebSocketWrapper {
//     webSocket: WebSocket;
//     event: IEventInfo;
//     loadLivescore: boolean;
//     messagesCount = 0;
//     eventEnded = false;
//     lastMessageTime: Date;
//     constructor(event: IEventInfo) {
//         this.event = event;
//         this.loadLivescore = event.loadLivescore;
//     }
//     public open() {
//         const url = this.event.websockerUrl;
//         const protocol = this.event.websockerProtocol;
//         this.webSocket = new WebSocket(url, protocol);
//         this.registerWebSocketEvents();
//     }
//     public close() {
//         this.eventEnded = true;
//         this.webSocket.close();
//     }
//     private registerWebSocketEvents() {
//         var self = this;
//         this.webSocket.onopen = function (event) {
//             console.warn(`${self.event.id} Started at: ${self.getCurrentTime()}`);
//             self.messagesCount = 0;
//             self.sendHandshake();
//         };
//         this.webSocket.onclose = function (event) {
//             console.warn(`${self.event.id} closed at: ${self.getCurrentTime()}`);
//             if (!self.eventEnded) {
//                 setTimeout(() => {
//                     //self.open();
//                 }, 1);
//             }
//         };
//         this.webSocket.onmessage = function (event) {
//             self.onDataArrived(event.data);
//         };
//         this.webSocket.onerror = function (event) {
//             debugger;
//             console.log(`Error on socket for id: ${self.event.id} ${event}`);
//         };
//     }
//     private sendHandshake() {
//         if (this.webSocket.readyState === WebSocket.OPEN) {
//             const handshakeData = this.event.handshakeMesage;
//             console.log(`Socket for id: ${this.event.id} sending handshake: ${handshakeData}`);
//             this.webSocket.send(handshakeData);
//             // this.webSocket.send(`\x16\x00OVInPlay_1_3\x01`);
//             // this.webSocket.send(`\x16\x00CONFIG_1_3\x01`);
//             // this.webSocket.send(`\x16\x00cSoYrm\x01`);
//         } else {
//             setTimeout(() => {
//                 this.sendHandshake();
//             }, 1000);
//         }
//     }
//     private getSubscriptionMessage(): string {
//         var eventIdArray = this.event.id.split("_");
//         var eventId = `${eventIdArray[0]}_1_1`;
//         const subscriptionMessage = `6V${eventId}`;
//         return this.getSubscribeMessage(subscriptionMessage);
//     }
//     private getLivescoreSubscriptionMessgae(): string {
//         const mediaSubscriptionId = `${this.event.C1}${this.event.T1}${this.event.C2}${this.event.T2}M${this.event.sportId}_1`;
//         return mediaSubscriptionId;
//     }
//     private sendOverview() {
//         const message = this.getSubscribeMessage("CONFIG_1_3");
//         this.webSocket.send(message);
//     }
//     private getSubscribeMessage(message) {
//         const CLIENT_SUBSCRIBE = 22;
//         const NONE_ENCODING = 0;
//         const RECORD_DELIM = 1;
//         const clientSubscribe = String.fromCharCode(CLIENT_SUBSCRIBE);
//         const noneEncoding = String.fromCharCode(NONE_ENCODING);
//         const recordDelim = String.fromCharCode(RECORD_DELIM);
//         return `${clientSubscribe}${noneEncoding}${message}${recordDelim}`;
//     }
//     private getCommandMessage() {
//         const FIELD_SEND = 2;
//         const CLIENT_SEND = 2;
//         const NONE_ENCODING = 0;
//         const RECORD_DELIM = 1;
//         const fieldSend = String.fromCharCode(FIELD_SEND);
//         const clientSend = String.fromCharCode(CLIENT_SEND);
//         const noneEncoding = String.fromCharCode(NONE_ENCODING);
//         const recordDelim = String.fromCharCode(RECORD_DELIM);
//         return `${clientSend}${noneEncoding}command${recordDelim}nst${recordDelim}d1rFXw==.zfN0yQnn4v8164XaQOShtBlHi+jtLcz9PP6dZdCmblk=${fieldSend}SPTBK`;
//     }
//     private subscribe() {
//         //setInterval(() => {
//         const subscriptionMessage = this.getSubscriptionMessage();
//         console.log(`Socket for id: ${this.event.id} opened!! subscribe to ${subscriptionMessage}`);
//         this.webSocket.send(subscriptionMessage);
//         if (this.loadLivescore) {
//             const subscriptionText = this.getLivescoreSubscriptionMessgae();
//             this.webSocket.send(subscriptionText);
//         }
//         //}, 1000);
//     }
//     sendCommand = false;
//     private onDataArrived(message) {
//         if (message.startsWith("100")) {
//             this.lastMessageTime = new Date();
//             console.log(`(${this.messagesCount})[${this.getCurrentTime()}] - data for id: ${this.event.id} - ${message}`);
//             this.sendOverview();
//             //this.checkSocketValidation();
//             return;
//         } else if (message.includes("CONFIG_1_3")) {
//             this.lastMessageTime = new Date();
//             console.log(`(${this.messagesCount})[${this.getCurrentTime()}] - data for id: ${this.event.id} - ${message}`);
//             // this.webSocket.send(this.getCommandMessage());
//             // this.webSocket.send(`\x16\x00gqXA1Z\x01`);
//             this.subscribe();
//             return;
//         }
//         this.lastMessageTime = new Date();
//         // console.log(`data for id: ${this.event.ID} ${message}`);
//         console.log(`(${this.messagesCount})[${this.getCurrentTime()}] - data for id: ${this.event.id} - ${message}`);
//         this.messagesCount++;
//     }
//     private getCurrentTime(): string {
//         var d = new Date();
//         var dformat = [
//             d.getHours(),
//             d.getMinutes(),
//             d.getSeconds()
//         ].join(':');
//         return dformat;
//     }
//     private checkSocketValidation() {
//         if (this.eventEnded) {
//             return;
//         }
//         setTimeout(() => {
//             this.subscribe();
//             this.checkSocketValidation();
//         }, 10000);
//     }
//     private restartSocket() {
//         this.webSocket.close();
//     }
// }
