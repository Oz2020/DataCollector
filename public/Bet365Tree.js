// ReSharper disable ExperimentalFeature
var activeEvents = new Map();
var activeEventsHash = new Map();
var updateTimes = new Map();
var subscriptionTimes = new Map();
var sendWithoutChangeInterval = 55;
var numberOfCyclesBeforeClean = 10 * 10; // 10 * 60 * 5; // Total of 5Min = 10 for 100msec per cycle = 1 sec * 60 sec * 5 min
var currentCycleNum = 0;
var isInitialized = false;

window.webSocket = {
    stateInternal: false,
    instance: null,
    stateListener: function (value) { },
    set state(value) {
        this.stateListener(value);
        this.stateInternal = value;
    },
    get state() {
        return this.stateInternal;
    },
    registerListener: function (listener) {
        this.stateListener = listener;
    }
}
window.webSocket.registerListener(function (value) {
    if (value !== this.state) {
        if (value) {
            onSocketConnected();
        } else {
            onSocketDisconnected();
        }
    }
});

function IsTableExists() {
    return window.Locator && window.Locator.treeLookup && window.Locator.treeLookup._table;
}

function writeLog(message) {
    if (typeof message === "string") {
        window.console.debug(`${message}`);
    } else {
        window.console.debug(`${JSON.stringify(message)}`);
    }
}

function notifyError(scope, error) {
    const errorMessage = {};

    if (typeof error === "string") {
        errorMessage.error = `${scope} - ${error}`;
    } else {
        errorMessage.error = `${scope} - ${JSON.stringify(error)}`;
    }

    if (window.DotNetBridge && window.DotNetBridge.NotifyError) {
        window.DotNetBridge.NotifyError(errorMessage.error);
    }
}

function notifyInfo(info) {

    if (typeof info === "string") {

        if (window.DotNetBridge && window.DotNetBridge.NotifyInfo) {
            window.DotNetBridge.NotifyInfo(info);
        }
    }
}

function notifyKeepAlive(keepAliveList) {
    try {
        if (window.isMaster && window.DotNetBridge && window.DotNetBridge.NotifyKeepAlive) {
            window.DotNetBridge.NotifyKeepAlive(JSON.stringify(keepAliveList));
        }
    } catch (e) {
        window.console.log("notifyKeepAlive error: ", e.message);
    }
}

function notifyData(data, timeStamp) {
    try {
        if (window.isMaster && window.DotNetBridge && window.DotNetBridge.HandleNewEvent) {
            window.DotNetBridge.HandleNewEvent(data, `${timeStamp}`);
        }
    } catch (e) {
        window.console.log("notifyData error: ", e.message);
    }
}

function GetTreeEntry(tree, entryName) {
    const found = Object.keys(tree).find(function (element) {
        return element.includes(entryName);
    });

    if (typeof found === 'undefined') {
        return found;
    }

    return tree[found];
}

function filterEvent(elm) {
    return !!elm &&
        elm.nodeName === 'EV' &&
        !!elm.data &&
        !!elm.data.C1 && elm.data.C1.length !== 0 &&
        !!elm.data.C2 && elm.data.C2.length !== 0 &&
        !!elm.data.T1 && elm.data.T1.length !== 0 &&
        !!elm.data.T2 && elm.data.T2.length !== 0 &&
        elm.data.ID.endsWith('_1_1');
}

function filterEventChild(elm) {
    return !!elm;
}

function mapLivescoreChild(elm) {
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
            const eventChildItem = mapLivescoreChild(item);

            liveScoreItem.children.push(eventChildItem);
        } catch (e) {
            notifyError("mapLivescoreChild", `${e.message}`);
        }
    }

    return liveScoreItem;
}

function mapLivescoreItem(elm, livescoreItem) {
    if (elm._actualChildren.length === 0) return;

    for (let i = 0; i < elm._actualChildren.length; i++) {
        try {
            const item = elm._actualChildren[i];
            const eventChildItem = mapLivescoreChild(item);

            livescoreItem.children.push(eventChildItem);
        } catch (e) {
            notifyError("mapLivescoreItem", `${e.message}`);
        }
    }
}

function mapStatsItem(elm, parentItem) {
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

            mapLivescoreItem(group, item);
            parentItem.statGroups.push(item);
        }
    }
}

function mapTeamGroupsItem(elm, parentItem) {
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

            mapLivescoreItem(group, item);
            parentItem.teamGroups.push(item);
        }
    }
}

function mapEvent(elm) {
    var childrenCount = 0;
    if (!!elm._actualChildren) {
        childrenCount = elm._actualChildren.length;
    }

    var item = {
        name: elm.nodeName,
        childrenCount: childrenCount,
        data: elm.data,
        children: []
    };

    return item;
}

function mapEventChild(elm) {
    const item = {
        name: elm.nodeName,
        data: elm.data
    };

    if (item.name !== "PA") {
        item.children = [];
        item.childrenCount = elm._actualChildren.length;
    }

    return item;
}

function fillChildren(parent, siteEvents) {
    if (!parent._actualChildren) {
        return;
    }

    for (let i = 0; i < parent._actualChildren.length; i++) {
        try {
            const item = parent._actualChildren[i];
            if (filterEventChild(item)) {
                let eventChildItem = mapEventChild(item);
                if (item._actualChildren.length > 0) {
                    fillChildren(item, eventChildItem);
                }
                siteEvents.children.push(eventChildItem);
            }
        } catch (e) {
            notifyError("fillChildren", `${e.message}`);
        }
    }
}

function fillLivescoreChildren(mainEventItem, mediaEventItem, siteEvents) {
    for (let i = 0; i < mainEventItem.additionalScores.length; i++) {
        try {
            const item = mainEventItem.additionalScores[i];
            for (let i = 0; i < item._actualChildren.length; i++) {
                const scoreItem = item._actualChildren[i];

                if (filterEventChild(scoreItem)) {
                    let eventChildItem = mapEventChild(scoreItem);
                    fillChildren(scoreItem, eventChildItem);
                    siteEvents.children.push(eventChildItem);
                }
            }

        } catch (e) {
            notifyError("fillLivescoreChildren", `${e.message}`);
        }
    }

    if (mainEventItem !== mediaEventItem) {
        let mergedData = {
            //Don't change the order
            ...mediaEventItem.data,
            ...mainEventItem.data
        }
        siteEvents.data = mergedData;
    }

    mapStatsItem(mainEventItem, siteEvents);
    mapTeamGroupsItem(mediaEventItem, siteEvents);
}

function isEventChanged(eventId, eventContent) {

    const oldHash = activeEventsHash.get(eventId);

    // If exist in cache check if change
    if (oldHash && oldHash === eventContent) {
        return false;
    } else {
        // Delete old key if they not match
        activeEventsHash.delete(eventId);
        subscriptionTimes.set(eventId, Date.now());
    }

    // Add new hash and return flag that they changed
    activeEventsHash.set(eventId, eventContent);
    return true;
}

function cleanOldHash() {
    try {
        if (currentCycleNum > numberOfCyclesBeforeClean) {
            currentCycleNum = 0;

            for (let k of activeEventsHash.keys()) {
                if (!activeEvents.has(k)) {
                    activeEventsHash.delete(k);
                }
            }
        } else {
            currentCycleNum++;
        }
    } catch (error) {
        window.console.error("Error in cleanOldHash: ", error.message);
    }
}

function printInfo() {
    try {
        var webSocketState = null;
        if (window.webSocket && window.webSocket.instance) {
            webSocketState = window.webSocket.instance.readyState;
        }
        window.console.log(`Browser Status: WebsocketState: ${webSocketState},
         updateLiveLastRunBefore: ${performance.now() - window.updateLiveLastRun} ms,
         getAllEventsLastRunBefore: ${performance.now() - window.getAllEventsLastRun} ms,
         IsLivescore: ${window.loadLivescore}, 
         IsMaster: ${window.isMaster}`);
    } catch (e) {
        notifyError("printInfo", `${e.message}`);
    } finally {
        window.setTimeout(() => {
            printInfo();
        }, 5000);
    }
}

function getAllEvents() {

    var keepAliveList = [];

    cleanOldHash();

    var t0 = performance.now();

    activeEvents.forEach((value, key) => {
        if (tableHasKey(key)) {
            const item = window.Locator.treeLookup._table[key];
            try {
                if (filterEvent(item)) {
                    const eventItem = mapEvent(item);

                    eventItem.isLivescore = window.loadLivescore;

                    if (eventItem.isLivescore) {
                        const mediaSubscriptionId = value;
                        if (window.Locator.treeLookup._table.hasOwnProperty(mediaSubscriptionId)) {
                            var mediaEventItem = window.Locator.treeLookup._table[mediaSubscriptionId];
                            fillLivescoreChildren(item, mediaEventItem, eventItem);
                        } else {
                            fillLivescoreChildren(item, item, eventItem);
                        }
                    } else {
                        fillChildren(item, eventItem);
                    }

                    eventItem.generatedEventId = generateNewEventId(eventItem);
                    keepAliveList.push(eventItem.generatedEventId);
                    sendEvent(key, eventItem, window.Locator.timeManager._lastUpdatedMS);
                }
            } catch (e) {
                notifyError("getAllEvents", `${e.message}`);
            }
        }
    });

    notifyKeepAlive(keepAliveList);

    var t1 = performance.now();

    var took = t1 - t0;
    if (took >= 1500) {
        window.console.warn(`getAllEvents finished after ${took} ms.`);
        notifyError("getAllEvents", `finished after ${took} ms.`);
    }
    window.getAllEventsLastRun = performance.now();
}

function generateNewEventId(eventItem) {
    const strEventId = `${eventItem.data.CL}_${eventItem.data.CT}_${eventItem.data.NA}`;
    return `${eventItem.data.ID}_${strEventId.hashCode()}`;
}

function sendEvent(key, eventItem, timeStamp) {
    const eventContent = JSON.stringify(eventItem);

    if (ShouldSendWithoutChange(eventItem)) {
        if (isEventChanged(key, eventContent) || timeFromUpdateElapsed(key)) {
            updateTimes.set(key, Date.now());
            notifyData(eventContent, timeStamp);
            return true;
        } else {
            return false;
        }
    } else {
        if (isEventChanged(key, eventContent)) {
            notifyData(eventContent, timeStamp);
            return true;
        } else {
            return false;
        }
    }
}

function timeFromUpdateElapsed(key) {
    if (updateTimes && updateTimes.has(key)) {
        var value = updateTimes.get(key);
        var difference = (Date.now() - value) / 1000;
        return difference >= sendWithoutChangeInterval;
    }
    return false;
}

// If its Livescore and Soccer event - send it always! 
function ShouldSendWithoutChange(eventItem) {
    return eventItem.isLivescore && eventItem.data.C1 === "1";
}

function getOverviewEventsIds(parent, eventIds) {
    if (parent.nodeName === "EV") {
        const data = parent.data;
        data.sportId = parent.parent.data.ID;
        eventIds.push(data);
        return;
    }

    for (let i = 0; i < parent._actualChildren.length; i++) {
        try {
            const item = parent._actualChildren[i];
            getOverviewEventsIds(item, eventIds);
        } catch (e) {
            notifyError("getOverviewEventsIds", `${e.message}`);
        }
    }
}

function getOVInPlay() {
    let events = [];
    const eventsEntryName = "OVInPlay";

    if (IsTableExists()) {
        const table = window.Locator.treeLookup._table;
        const found = GetTreeEntry(table, eventsEntryName);

        if (found == null || typeof found === 'undefined') {
            return null;
        }

        getOverviewEventsIds(found, events);
    }

    return events;
}

function registerWebsocketUpdateActiveEvents(events) {

    try {
        const registeredEvents = new Map();

        for (let i = 0; i < events.length; i++) {

            const event = events[i];

            //Convert to registration name pattern
            var eventIdArray = event.ID.split("_");
            var eventId = `${eventIdArray[0]}_1_1`;

            const subscribeId = `6V${eventId}`;

            if (window.approvedIdSuffixes) {
                var sumDigitsFromString = sum_digits_from_string(subscribeId);
                var isInApprovedIdSuffixes = window.approvedIdSuffixes.includes(sumDigitsFromString % 10);
                if (!isInApprovedIdSuffixes) {
                    continue;
                }
            }

            if (!window.loadLivescore) {
                registeredEvents.set(subscribeId);
            } else {
                const mediaSubscriptionId = `${event.C1}${event.T1}${event.C2}${event.T2}M${event.sportId}_1`;
                registeredEvents.set(subscribeId, mediaSubscriptionId);
            }

        }
        var shouldSubscribe = [];
        registeredEvents.forEach((value, key) => {

            if (subscriptionTimes.has(key))
                return;

            shouldSubscribe.push(key);

            if (value == null)
                return;

            shouldSubscribe.push(value);
        });

        if (shouldSubscribe.length > 0 && window.webSocket.instance.readyState === 1) {
            const subscriptionText = `\x16\x00${shouldSubscribe.join()}\x01`;
            window.webSocket.instance.send(subscriptionText);
            for (let i = 0; i < shouldSubscribe.length; i++) {
                subscriptionTimes.set(shouldSubscribe[i], Date.now());
            }
        }
        activeEvents = registeredEvents;

    } catch (e) {
        notifyError("registerWS", `${e.message}`);
    }
}

function tableHasKey(key) {
    return IsTableExists() && window.Locator.treeLookup._table.hasOwnProperty(key);
}

function sum_digits_from_string(dstr) {
    var dsum = 0;

    for (var i = 0; i < dstr.length; i++) {

        if (/[0-9]/.test(dstr[i])) dsum += parseInt(dstr[i])
    }
    return dsum;
}

function onSocketConnected() {
    if (window.DotNetBridge && window.DotNetBridge.SocketConnected) {
        window.DotNetBridge.SocketConnected();
    }
}

function onSocketDisconnected() {
    if (window.DotNetBridge && window.DotNetBridge.SocketDisconnected) {
        window.DotNetBridge.SocketDisconnected();
    }
}

function ValidateWebSocketExists() {

    if (window.webSocket.instance && window.webSocket.instance.readyState === 1) {
        if (browserIsReady()) {
            window.webSocket.state = true;
        }
        return true;
    }

    if (!window.Locator) {
        notifyError("ValidateWebSocketExists", "Locator is null");
        return false;
    }

    if (!window.Locator.subscriptionManager) {
        notifyError("ValidateWebSocketExists", "subscriptionManager is null");
        return false;
    }

    if (!window.Locator.subscriptionManager._streamDataProcessor) {
        notifyError("ValidateWebSocketExists", "_streamDataProcessor is null");
        return false;
    }

    if (!window.Locator.subscriptionManager._streamDataProcessor._serverConnection) {
        notifyError("ValidateWebSocketExists", "_serverConnection is null");
        return false;
    }

    if (!window.Locator.subscriptionManager._streamDataProcessor._serverConnection._currentTransportMethod) {
        notifyError("ValidateWebSocketExists", "_currentTransportMethod is null");
        return false;
    }

    if (!window.Locator.subscriptionManager._streamDataProcessor._serverConnection._currentTransportMethod._socket) {
        notifyError("ValidateWebSocketExists", "_socket is null");
        return false;
    }

    window.webSocket.instance = window.Locator.subscriptionManager._streamDataProcessor._serverConnection._currentTransportMethod._socket;

    if (window.webSocket.instance && window.webSocket.instance.readyState === 1) {
        writeLog(`ValidateWebSocketExists: socket ready: ${window.webSocket.instance.readyState}`);

        if (browserIsReady()) {
            window.webSocket.state = true;
        }

        window.webSocket.instance.onclose = function (event) {
            window.console.log("WebSocket is closed now.");
            window.webSocket.state = false;
        };

        window.webSocket.instance.onmessage = function (event) {
            if (window.DotNetBridge && window.DotNetBridge.SocketMessageArrived) {
                window.DotNetBridge.SocketMessageArrived();
            }
        };

        return true;
    }

    writeLog(`ValidateWebSocketExists: socket notready`);
    return false;
}

function browserIsReady() {
    if (isInitialized)
        return true;

    if (!activeEvents || activeEvents.size === 0)
        return false;

    var existsInTableCount = 0;

    activeEvents.forEach((_value, key) => {
        if (tableHasKey(key))
            ++existsInTableCount;
    });

    var currentExistPercent = (existsInTableCount / activeEvents.size) * 100;
    if (currentExistPercent >= window.existPercent) {
        isInitialized = true;
        return true;
    }
    return false;
}

async function wait(ms) {
    return new Promise(resolve => {
        window.setTimeout(resolve, ms);
    });
}

async function readTree() {
    try {
        if (!ValidateWebSocketExists()) {
            window.webSocket.state = false;
            await wait(1000);
        }
        if (activeEvents && activeEvents.size !== 0)
            getAllEvents();
        if (!window.isMaster) {
            await wait(1000);
        }
    } catch (e) {
        notifyError("readTree", `${JSON.stringify(e)}`);

    } finally {
        window.setTimeout(() => {
            readTree();
        }, 100);
    }
}

async function wait(ms) {
    return new Promise(resolve => {
        window.setTimeout(resolve, ms);
    });
}

function clearSubscriptionTimesCache() {
    try {
        const toRemove = [];
        subscriptionTimes.forEach((value, key) => {
            try {
                var difference = (Date.now() - value) / 1000;
                if (difference >= window.resubscriptionInterval) {
                    toRemove.push(key);
                }
            } catch (e) {
                notifyError("clearSubscriptionTimesCache", `${e.message}`);
            }
        });

        toRemove.forEach(key => {
            subscriptionTimes.delete(key);
        });

    } catch (e) {
        notifyError("clearSubscriptionTimesCache", `${JSON.stringify(e)}`);
    } finally {
        window.setTimeout(() => {
            clearSubscriptionTimesCache();
        }, 15000);
    }
}

function clearUpdateTimesCache() {
    try {
        const toRemove = [];
        updateTimes.forEach((_value, key) => {
            try {
                if (activeEvents && !activeEvents.has(key)) {
                    toRemove.push(key);
                }
            } catch (e) {
                notifyError("clearUpdateTimesCache", `${e.message}`);
            }
        });

        toRemove.forEach(key => {
            updateTimes.delete(key);
        });
    } catch (e) {
        notifyError("clearUpdateTimesCache", `${JSON.stringify(e)}`);
    } finally {
        window.setTimeout(() => {
            clearUpdateTimesCache();
        }, 5000);
    }
}

function updateLive() {
    try {
        var t0 = performance.now();
        const events = getOVInPlay();

        if (events && events.length !== 0 && window.webSocket.instance)
            registerWebsocketUpdateActiveEvents(events);

        var t1 = performance.now();
        var took = t1 - t0;
        if (took >= 1500) {
            window.console.warn(`updateLive finished after ${took} ms.`);
            notifyError("updateLive", `finished after ${took} ms.`);
        }
    } catch (e) {
        notifyError("updateLive", `${e.message}`);
    } finally {
        window.updateLiveLastRun = performance.now();
        window.setTimeout(() => {
            updateLive();
        }, 100);
    }
}

String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) {
        return "";
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString();
}

setTimeout(() => {
    updateLive();
}, 5000);

setTimeout(() => {
    readTree();
}, 5000);

setTimeout(() => {
    clearUpdateTimesCache();
}, 5000);

setTimeout(() => {
    clearSubscriptionTimesCache();
}, 15000);

setTimeout(() => {
    printInfo();
}, 5000);