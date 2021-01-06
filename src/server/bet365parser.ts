
var win = window as any;
win.flashvars.TIME_LEFT = 60 * 60; // 1 hour

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

class EventsDispatcher {

    url = "ws://localhost:";
    parser: Bet365Parser;
    websocket: WebSocket;
    queuedCommands = [];
    activeEvents: [];

    constructor(private websokcetPort: number) {
    }

    public open() {
        this.websocket = new WebSocket(`${this.url}${this.websokcetPort}`);
        this.registerWebSocketEvents();
    }

    // isOneSent = false;
    public eventAdded(event: IEventInfo) {
        // if(this.isOneSent) return;

        // this.isOneSent = true;
        const commandInfo = {
            command: "addEvent",
            payload: JSON.stringify(event)
        };

        if (!this.isSocketOpen()) {
            this.queuedCommands.push(commandInfo);
            return;
        }

        this.websocket.send(JSON.stringify(commandInfo));
    }

    public eventRemoved(event: IEventInfo) {
        const commandInfo = {
            command: "removeEvent",
            payload: JSON.stringify(event)
        };

        if (!this.isSocketOpen()) {
            this.queuedCommands.push(commandInfo);
            return;
        }

        this.websocket.send(JSON.stringify(commandInfo));
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

        // this.websocket.onmessage = function (event) {
        //     try {
        //         // self.handleSocketMessgae(event.data);
        //     } catch (error) {
        //         self.logError(`[Socket:onmessage] - ${error.message}`);
        //     }
        // };

        this.websocket.onerror = function (event) {
            try {
                self.logError(event);
            } catch (error) {
                self.logError(`[Socket:onerror] - ${error.message}`);
            }
        };
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
        console.log(error);
        debugger;
    }
}

class Bet365WebSocketsManager {

    eventsDispatcher: EventsDispatcher;
    browserId: string;

    constructor(private bet365Socket: WebSocket) {
        const localSocketPort = window.document["localSocketPort"];
        this.browserId = window.document["browserId"];
        this.eventsDispatcher = new EventsDispatcher(localSocketPort);
        this.eventsDispatcher.open();
    }

    public isOpen() {
        return this.bet365Socket && this.bet365Socket.readyState === WebSocket.OPEN
    }

    public addEvent(event: any, loadLivescore: boolean) {
        // if (!event.ID.includes("95384474C1A")) {
        //     // console.log(event.ID);
        //     return;
        // }

        try {
            const eventInfo: IEventInfo = {
                browserId: this.browserId,
                id: event.ID,
                C1: event.C1,
                T1: event.T1,
                C2: event.C2,
                T2: event.T2,
                sportId: event.sportId,
                loadLivescore: loadLivescore
            };

            this.eventsDispatcher.eventAdded(eventInfo);
        } catch (error) {
            debugger;
        }
    }

    public removeEvent(event: any) {
        try {
            const eventInfo: IEventInfo = {
                browserId: this.browserId,
                id: event.ID,
            };
            this.eventsDispatcher.eventRemoved(eventInfo);

        } catch (error) {
            debugger;
            return;
        }
    }

}

class Bet365Parser {
    webSocketsManager: Bet365WebSocketsManager = null;
    window: any;
    isStarted = false;
    activeEvents = [];
    activeEventsHash = new Map();
    loadLivescore = false;
    subscriptionTimes = new Map();
    socketRecycled = false;

    constructor(window) {
        this.window = window;
    }

    public start() {
        if (this.isStarted) {
            return;
        }
        this.isStarted = true;
        setTimeout(() => {
            this.readTree();
        }, 3000);
    }

    private async readTree() {
        try {
            if (!this.getSocketInstance()) {
                await this.wait(1000);
            }
            const events = await this.getEventsEntries();
            this.handleAddedEevts(events);
            this.handleRemovedEevts(events);
        } catch (e) {
            this.notifyError("readTree", `${JSON.stringify(e)}`);
        } finally {
            window.setTimeout(() => {
                this.readTree();
            }, 100);
        }
    }

    private handleAddedEevts(events: any[]) {
        try {
            let newEvents = events.filter(x => !this.activeEvents.includes(x));
            if (newEvents.length > 0) {
                //console.log(`new Events: ${newEvents.length}`);
            }
            for (let i = 0; i < newEvents.length; i++) {
                const event = newEvents[i];
                if (!this.subscriptionTimes.has(event.ID)) {
                    this.webSocketsManager.addEvent(event, this.loadLivescore);
                    this.activeEvents.push(event);
                    this.subscriptionTimes.set(event.ID, event);
                }
            }
        } catch (e) {
            this.notifyError("handleAddedEevts", `${e.message}`);
        }
    }

    private handleRemovedEevts(events: any[]) {
        try {
            let removedEvents = this.activeEvents.filter(x => !events.includes(x));
            if (removedEvents.length > 0) {
                //console.log(`removedEvents: ${removedEvents.length}`);
            }
            for (let i = 0; i < removedEvents.length; i++) {
                const event = removedEvents[i];
                //console.log(`removedEvent: ${event.ID}`);
                this.subscriptionTimes.delete(event.ID);
                const index = this.activeEvents.indexOf(event);
                this.activeEvents.splice(index, 1);
                this.webSocketsManager.removeEvent(event);
            }
        } catch (e) {
            this.notifyError("handleRemovedEevts", `${e.message}`);
        }
    }

    private getEventsEntries(): Promise<any[]> {
        return new Promise<any[]>(resolve => {
            try {
                let events = [];
                const eventsEntryName = "OVInPlay";
                if (this.IsTableExists()) {
                    const table = this.window.Locator.treeLookup._table;
                    const found = this.GetTreeEntry(table, eventsEntryName);
                    if (found == null || typeof found === 'undefined') {
                        resolve([]);
                        return;
                    }
                    this.getOverviewEventsIds(found, events);
                }
                resolve(events);
            } catch (error) {
                resolve([]);
            }
        });
    }

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

    private getSocketInstance() {
        if (this.webSocketsManager != null && this.webSocketsManager.isOpen()) {
            // debugger
            // if (this.socketRecycled) {
            return true;
            // } else {
            //     this.socketRecycled = true;
            //     this.bet365WebSocket.close()
            // }
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
        this.webSocketsManager = new Bet365WebSocketsManager(webSocketWrapper._socket);
        return this.webSocketsManager.isOpen();
    }

    private async wait(ms) {
        return new Promise(resolve => {
            window.setTimeout(resolve, ms);
        });
    }

    private notifyError(methodName: string, errorMsg: string) {
        console.log(`[ERROR] - ${methodName} - ${errorMsg}`)
    }
}

const parser = new Bet365Parser(window);
parser.start();