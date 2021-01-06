var win = window as any;
win.flashvars.TIME_LEFT = 100;
var SERVER_PORT = 3100;

window.addEventListener('beforeunload', function (e) {
    // Cancel the event
    e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    // Chrome requires returnValue to be set
    e.returnValue = true;

    console.log("Close window suppressed by code");
});

interface ICommandInfo {
    command: string;
    payload: any;
}

interface IEventInfo {
    browserId: string;
    id: string;
    C1?: string;
    T1?: string;
    C2?: string;
    T2?: string;
    sportId?: string;
    loadLivescore?: boolean;
}

interface IEventDataInfo {
    browserId?: string;
    name: string;
    childrenCount: number;
    data: any;
    children: any[];
    isLivescore?: boolean;
    teamGroups?: any[];
    statGroups?: any[];
}

class EventsDataDispatcher {

    url = "ws://localhost:";
    websocket: WebSocket;
    queuedCommands = [];
    activeEvents: [];

    constructor(
        private dataCoordinator: DataCoordinator,
        private websokcetPort: number) {
    }

    public open() {
        this.websocket = new WebSocket(`${this.url}${this.websokcetPort}`);
        this.registerWebSocketEvents();
    }

    public sendEventInfo(event: string) {
        try {
            const commandInfo: ICommandInfo = {
                command: "eventDataInfo",
                payload: event
            };

            if (!this.isSocketOpen()) {
                this.queuedCommands.push(commandInfo);
                return;
            }

            const jsonMessage = JSON.stringify(commandInfo);
            // const size = this.lengthInUtf8Bytes(jsonMessage);
            // if (size > 50000) {
            //     return;
            // }

            this.sendEventData(jsonMessage);
            // this.websocket.send(jsonMessage);
        } catch (error) {
            debugger;
        }
    }

    private sendEventData(message: string) {
        const Http = new XMLHttpRequest();
        const url = `http://localhost:${SERVER_PORT}/events/data`;
        Http.open("POST", url, true);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.send(message);

        Http.onreadystatechange = (e) => {
            // console.log(Http.responseText)
        }
    }

    private lengthInUtf8Bytes(str): number {
        // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    }

    private registerWebSocketEvents() {
        var self = this;

        this.websocket.onopen = function (event) {
            try {
                console.log(`Socket opened for: ${self.url}${self.websokcetPort}`);
                self.sendQueuedCommands();
            } catch (error) {
                self.logError(`[Socket:onopen] - ${error.message}`);
            }
        };

        this.websocket.onclose = function (event) {
            try {
                setTimeout(() => {
                    self.open();
                }, 10);
            } catch (error) {
                self.logError(`[Socket:onclose] - ${error.message}`);
            }
        };

        this.websocket.onmessage = function (event) {
            try {
                self.handleSocketMessgae(event.data);
            } catch (error) {
                self.logError(`[Socket:onmessage] - ${error.message}`);
            }
        };

        this.websocket.onerror = function (event) {
            try {
                self.logError(event);
            } catch (error) {
                self.logError(`[Socket:onerror] - ${error.message}`);
            }
        };
    }

    private handleSocketMessgae(message: string) {
        const commandInfo = JSON.parse(message) as ICommandInfo;
        if (commandInfo == undefined) {
            debugger
            // TODO:: add to error log or monitor
            return;
        }

        switch (commandInfo.command) {
            case "subscribe": {
                const eventInfo = JSON.parse(commandInfo.payload);
                this.subscribeToEvent(eventInfo);
                break;
            }
            case "unsubscribe": {
                const eventInfo = JSON.parse(commandInfo.payload);
                this.unsubscribeToEvent(eventInfo);
                break;
            }
            default: {
                debugger
                break;
            }
        }
    }

    private isSocketOpen(): boolean {
        return this.websocket && this.websocket.readyState === WebSocket.OPEN;
    }

    private sendQueuedCommands() {
        return new Promise<void>(resolve => {
            try {
                let ended = false;
                while (!ended) {
                    const command = this.queuedCommands.pop();
                    if (command == null || command == undefined) {
                        ended = true;
                    } else {
                        this.websocket.send(JSON.stringify(command));
                    }

                }
            } catch (error) {
                this.logError(error);
            }

            resolve();
        });
    }

    private logError(error: any) {
        console.error(error);
    }

    private subscribeToEvent(evenyInfo: IEventInfo) {
        this.dataCoordinator.subscribeToEvent(evenyInfo);
    }

    private unsubscribeToEvent(evenyInfo: IEventInfo) {
        this.dataCoordinator.unsubscribeToEvent(evenyInfo);
    }
}

class Bet365SocketsManager {

    eventsDispatcher: EventsDataDispatcher;
    browserId: string;

    constructor(private dataCoordinator: DataCoordinator) {
        this.browserId = window.document["browserId"];
        const localSocketPort = window.document["localSocketPort"];
        this.eventsDispatcher = new EventsDataDispatcher(dataCoordinator, localSocketPort);
        this.eventsDispatcher.open();
    }

    public addEvent(event: string) {
        this.eventsDispatcher.sendEventInfo(event);
    }

    public removeEvent(event: any) {
        try {
            const eventInfo: IEventInfo = {
                browserId: this.browserId,
                id: event.ID,
            };
            // this.eventsDispatcher.eventRemoved(eventInfo);
            console.log("removeEvent: ", eventInfo);

        } catch (error) {
            debugger;
            return;
        }
    }

}

class TreeExtractor {
    webSocket: WebSocket = null;
    window: any;
    isStarted = false;
    activeEvents = new Map();
    activeEventsHash = new Map();
    loadLivescore = false;
    subscriptionTimes = new Map();
    socketRecycled = false;
    subscriptionEvents = [];
    keepAliveList: [];

    constructor(private dataCoordinator: DataCoordinator, window) {
        this.window = window;
    }

    public start() {
        if (this.isStarted) {
            return;
        }
        this.isStarted = true;
        setTimeout(() => {
            this.readTree();
        }, 1000);
        setTimeout(() => {
            this.runSubscriptionLoop();
        }, 1000);
    }

    public subscribeToEvent(eventInfo: IEventInfo) {
        if (this.activeEvents.has(eventInfo.id)) {
            return;
        }

        var eventIdArray = eventInfo.id.split("_");
        var eventId = `${eventIdArray[0]}_1_1`;
        const subscribeId = `6V${eventId}`;
        this.activeEvents.set(subscribeId, eventInfo);
        const subscriptionText = `\x16\x00${subscribeId}\x01`;
        this.subscriptionEvents.push(subscriptionText);
    }

    public unsubscribeToEvent(eventInfo: IEventInfo) {
        if (!this.activeEvents.has(eventInfo.id)) {
            return;
        }

        this.activeEvents.delete(eventInfo.id);

        var eventIdArray = eventInfo.id.split("_");
        var eventId = `${eventIdArray[0]}_1_3`;
        const subscriptionInfo = `6V${eventId}`;

        this.subscriptionEvents.push(subscriptionInfo);
    }

    private runSubscriptionLoop() {
        try {
            if (this.webSocket.readyState === WebSocket.OPEN) {
                const copyList = [...this.subscriptionEvents];
                copyList.forEach(subscriptionInfo => {
                    console.log("runSubscriptionLoop: ", subscriptionInfo);
                    this.webSocket.send(subscriptionInfo);
                    const index = this.subscriptionEvents.findIndex(x => x === subscriptionInfo);
                    this.subscriptionEvents.splice(index, 1);
                });
            }
        } catch (error) {
            debugger;
            console.error(error);
        } finally {
            setTimeout(() => {
                this.runSubscriptionLoop();
            }, 1000);
        }
    }

    private async readTree() {
        try {
            if (!this.isWebsocketOpened()) {
                await this.wait(1000);
            }

            const table = this.window.Locator.treeLookup._table;
            this.activeEvents.forEach((value, key) => {
                if (this.tableHasKey(key)) {
                    const item = table[key];
                    try {
                        if (this.filterEvent(item)) {
                            const eventItem = this.mapEvent(item);

                            eventItem.isLivescore = false;

                            if (eventItem.isLivescore) {
                                const mediaSubscriptionId = value;
                                if (table.hasOwnProperty(mediaSubscriptionId)) {
                                    var mediaEventItem = table[mediaSubscriptionId];
                                    this.fillLivescoreChildren(item, mediaEventItem, eventItem);
                                } else {
                                    this.fillLivescoreChildren(item, item, eventItem);
                                }
                            } else {
                                this.fillChildren(item, eventItem);
                            }

                            this.sendEvent(key, eventItem, this.window.Locator.timeManager._lastUpdatedMS);
                        }
                    } catch (e) {
                        this.notifyError("getAllEvents", `${e.message}`);
                        debugger
                    }
                }
            });
        } catch (e) {
            debugger
            this.notifyError("readTree", `${JSON.stringify(e)}`);
        } finally {
            window.setTimeout(() => {
                this.readTree();
            }, 100);
        }
    }

    private tableHasKey(key) {
        return this.IsTableExists() && this.window.Locator.treeLookup._table.hasOwnProperty(key);
    }

    private filterEvent(elm) {
        return !!elm &&
            elm.nodeName === 'EV' &&
            !!elm.data &&
            !!elm.data.C1 && elm.data.C1.length !== 0 &&
            !!elm.data.C2 && elm.data.C2.length !== 0 &&
            !!elm.data.T1 && elm.data.T1.length !== 0 &&
            !!elm.data.T2 && elm.data.T2.length !== 0 &&
            elm.data.ID.endsWith('_1_1');
    }

    private mapEvent(elm): IEventDataInfo {
        var childrenCount = 0;
        if (!!elm._actualChildren) {
            childrenCount = elm._actualChildren.length;
        }

        var item: IEventDataInfo = {
            name: elm.nodeName,
            childrenCount: childrenCount,
            data: elm.data,
            children: [],
            isLivescore: false,
        };

        return item;
    }

    private fillChildren(parent, eventData: IEventDataInfo) {
        if (!parent._actualChildren) {
            return;
        }

        for (let i = 0; i < parent._actualChildren.length; i++) {
            try {
                const item = parent._actualChildren[i];
                if (this.filterEventChild(item)) {
                    let eventChildItem = this.mapEventChild(item);
                    if (item._actualChildren.length > 0) {
                        this.fillChildren(item, eventChildItem);
                    }
                    eventData.children.push(eventChildItem);
                }
            } catch (e) {
                this.notifyError("fillChildren", `${e.message}`);
            }
        }
    }

    private fillLivescoreChildren(mainEventItem, mediaEventItem, eventData: IEventDataInfo) {
        for (let i = 0; i < mainEventItem.additionalScores.length; i++) {
            try {
                const item = mainEventItem.additionalScores[i];
                for (let i = 0; i < item._actualChildren.length; i++) {
                    const scoreItem = item._actualChildren[i];

                    if (this.filterEventChild(scoreItem)) {
                        let eventChildItem = this.mapEventChild(scoreItem);
                        this.fillChildren(scoreItem, eventChildItem);
                        eventData.children.push(eventChildItem);
                    }
                }

            } catch (e) {
                this.notifyError("fillLivescoreChildren", `${e.message}`);
            }
        }

        if (mainEventItem !== mediaEventItem) {
            let mergedData = {
                //Don't change the order
                ...mediaEventItem.data,
                ...mainEventItem.data
            }
            eventData.data = mergedData;
        }

        this.mapStatsItem(mainEventItem, eventData);
        this.mapTeamGroupsItem(mediaEventItem, eventData);
    }

    private filterEventChild(elm) {
        return !!elm;
    }

    private mapEventChild(elm): IEventDataInfo {
        const item: IEventDataInfo = {
            name: elm.nodeName,
            data: elm.data,
            children: [],
            childrenCount: 0
        };

        if (item.name !== "PA") {
            item.children = [];
            item.childrenCount = elm._actualChildren.length;
        }

        return item;
    }

    // private generateNewEventId(eventItem) {
    //     const strEventId = `${eventItem.data.CL}_${eventItem.data.CT}_${eventItem.data.NA}`;
    //     return `${eventItem.data.ID}_${this.hashCode(strEventId)}`;
    // }


    private sendEvent(key: string, eventItem: IEventDataInfo, timeStamp: any) {
        try {
            const eventContent = JSON.stringify(eventItem);

            if (this.isEventChanged(key, eventContent)) {
                this.dataCoordinator.publishEventData(eventContent, timeStamp);
            }
        } catch (error) {
            debugger;
        }
    }

    private isEventChanged(eventId, eventContent) {

        const oldHash = this.activeEventsHash.get(eventId);

        // If exist in cache check if change
        if (oldHash && oldHash === eventContent) {
            return false;
        } else {
            // Delete old key if they not match
            this.activeEventsHash.delete(eventId);
            this.subscriptionTimes.set(eventId, Date.now());
        }

        // Add new hash and return flag that they changed
        this.activeEventsHash.set(eventId, eventContent);
        return true;
    }

    private mapStatsItem(elm, parentItem: IEventDataInfo) {
        if (!!elm.statGroups) {
            parentItem.statGroups = [];

            for (let i = 0; i < elm.statGroups.length; i++) {
                const group = elm.statGroups[i];

                const item = {
                    name: group.nodeName,
                    childrenCount: group._actualChildren.length,
                    data: group.data,
                    children: []
                };

                this.mapLivescoreItem(group, item);
                parentItem.statGroups.push(item);
            }
        }
    }

    private mapTeamGroupsItem(elm, parentItem: IEventDataInfo) {
        if (!!elm.teamGroups) {
            parentItem.teamGroups = [];

            for (let i = 0; i < elm.teamGroups.length; i++) {
                const group = elm.teamGroups[i];

                const item = {
                    name: group.nodeName,
                    childrenCount: group._actualChildren.length,
                    data: group.data,
                    children: []
                };

                this.mapLivescoreItem(group, item);
                parentItem.teamGroups.push(item);
            }
        }
    }

    private mapLivescoreChild(elm) {
        const liveScoreItem = {
            name: elm.nodeName,
            data: elm.data,
            children: [],
            childrenCount: elm._actualChildren.length
        };
        if (elm.data.AD) {
            debugger;
        }
        if (elm._actualChildren.length === 0) return liveScoreItem;

        for (let i = 0; i < elm._actualChildren.length; i++) {
            try {
                const item = elm._actualChildren[i];
                const eventChildItem = this.mapLivescoreChild(item);

                liveScoreItem.children.push(eventChildItem);
            } catch (e) {
                this.notifyError("mapLivescoreChild", `${e.message}`);
            }
        }

        return liveScoreItem;
    }

    private mapLivescoreItem(elm, livescoreItem) {
        if (elm._actualChildren.length === 0) return;

        for (let i = 0; i < elm._actualChildren.length; i++) {
            try {
                const item = elm._actualChildren[i];
                const eventChildItem = this.mapLivescoreChild(item);

                livescoreItem.children.push(eventChildItem);
            } catch (e) {
                this.notifyError("mapLivescoreItem", `${e.message}`);
            }
        }
    }

    // private handleAddedEevts(events: any[]) {
    //     try {
    //         let newEvents = events.filter(x => !this.activeEvents.includes(x));
    //         if (newEvents.length > 0) {
    //             //console.log(`new Events: ${newEvents.length}`);
    //         }
    //         for (let i = 0; i < newEvents.length; i++) {
    //             const event = newEvents[i];
    //             if (!this.subscriptionTimes.has(event.ID)) {
    //                 //this.webSocketsManager.addEvent(event, this.loadLivescore);
    //                 console.log(`addedEvent: ${event.ID}`);
    //                 this.activeEvents.push(event);
    //                 this.subscriptionTimes.set(event.ID, event);
    //             }
    //         }
    //     } catch (e) {
    //         this.notifyError("handleAddedEevts", `${e.message}`);
    //     }
    // }

    // private handleRemovedEevts(events: any[]) {
    //     try {
    //         let removedEvents = this.activeEvents.filter(x => !events.includes(x));
    //         if (removedEvents.length > 0) {
    //             //console.log(`removedEvents: ${removedEvents.length}`);
    //         }
    //         for (let i = 0; i < removedEvents.length; i++) {
    //             const event = removedEvents[i];
    //             console.log(`removedEvent: ${event.ID}`);
    //             this.subscriptionTimes.delete(event.ID);
    //             const index = this.activeEvents.indexOf(event);
    //             this.activeEvents.splice(index, 1);
    //             //this.webSocketsManager.removeEvent(event);
    //         }
    //     } catch (e) {
    //         this.notifyError("handleRemovedEevts", `${e.message}`);
    //     }
    // }

    // private getEventsEntries(): Promise<any[]> {
    //     return new Promise<any[]>(resolve => {
    //         let events = [];

    //         try {
    //             const eventsEntryName = "OVInPlay";
    //             if (this.IsTableExists()) {
    //                 const table = this.window.Locator.treeLookup._table;
    //                 const found = this.GetTreeEntry(table, eventsEntryName);

    //                 if (found == null || typeof found === 'undefined') {
    //                     resolve(events);
    //                     return;
    //                 }

    //                 this.getOverviewEventsIds(found, events);
    //             }
    //             resolve(events);
    //         } catch (error) {
    //             resolve(events);
    //         }
    //     });
    // }

    private getOverviewEventsIds(parent, eventIds) {
        if (parent.nodeName === "EV") {
            const data = parent.data;
            data.sportId = parent.parent.data.ID;
            eventIds.push(data);
            return;
        }
        for (let i = 0; i < parent._actualChildren.length; i++) {
            try {
                const item = parent._actualChildren[i];
                this.getOverviewEventsIds(item, eventIds);
            } catch (e) {
                this.notifyError("getOverviewEventsIds", `${e.message}`);
            }
        }
    }

    private GetTreeEntry(tree, entryName) {
        const found = Object.keys(tree).find(function (element) {
            return element.includes(entryName);
        });
        if (typeof found === 'undefined') {
            return found;
        }
        return tree[found];
    }

    private IsTableExists() {
        return this.window.Locator &&
            this.window.Locator.treeLookup &&
            this.window.Locator.treeLookup._table;
    }

    private isWebsocketOpened() {
        if (this.webSocket != null && this.webSocket.readyState === WebSocket.OPEN) {
            return true;
        }

        if (!this.window.Locator) {
            this.notifyError("ValidateWebSocketExists", "Locator is null");
            return false;
        }

        if (!this.window.Locator.subscriptionManager) {
            this.notifyError("ValidateWebSocketExists", "subscriptionManager is null");
            return false;
        }

        if (!this.window.Locator.subscriptionManager._streamDataProcessor) {
            this.notifyError("ValidateWebSocketExists", "_streamDataProcessor is null");
            return false;
        }

        if (!this.window.Locator.subscriptionManager._streamDataProcessor._serverConnection) {
            this.notifyError("ValidateWebSocketExists", "_serverConnection is null");
            return false;
        }

        if (!this.window.Locator.subscriptionManager._streamDataProcessor._serverConnection._currentTransportMethod) {
            this.notifyError("ValidateWebSocketExists", "_currentTransportMethod is null");
            return false;
        }

        if (!this.window.Locator.subscriptionManager._streamDataProcessor._serverConnection._currentTransportMethod._socket) {
            this.notifyError("ValidateWebSocketExists", "_socket is null");
            return false;
        }

        // Get websocket wrapper object
        var webSocketWrapper = this.window.Locator.subscriptionManager._streamDataProcessor._serverConnection._currentTransportMethod;
        this.webSocket = webSocketWrapper._socket;
        return this.webSocket != null && this.webSocket.readyState === WebSocket.OPEN;
    }

    private async wait(ms) {
        return new Promise(resolve => {
            window.setTimeout(resolve, ms);
        });
    }

    private notifyError(methodName: string, errorMsg: string) {
        console.log(`[ERROR] - ${methodName} - ${errorMsg}`)
    }

    private hashCode(str: string): string {
        var hash = 0;
        if (str.length == 0) {
            return "";
        }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString();
    }
}


class DataCoordinator {

    socketsManager: Bet365SocketsManager;
    treeExtractor: TreeExtractor;

    constructor() {
        this.socketsManager = new Bet365SocketsManager(this)
        this.treeExtractor = new TreeExtractor(this, window);
    }

    public start() {
        this.treeExtractor.start();
    }

    public subscribeToEvent(evenyInfo: IEventInfo) {
        this.treeExtractor.subscribeToEvent(evenyInfo);
    }

    public unsubscribeToEvent(evenyInfo: IEventInfo) {
        this.treeExtractor.unsubscribeToEvent(evenyInfo);
    }

    public publishEventData(eventContent: string, timeStamp: string) {
        this.socketsManager.addEvent(eventContent)
    }
}

var dataCoordinator = new DataCoordinator();
dataCoordinator.start();