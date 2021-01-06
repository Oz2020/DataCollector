import { RMQProducerService } from "../common/rmqProducerService";
import { RMQConsumerService } from "../common/rmqConsumerService";
import { IBrowserManager } from "../interfces/IBrowserManager";
import { IEventInfo } from "../interfces/IEventInfo";
import { IEventsDataReceiver } from "../interfces/IEventsDataReceiver";
import { EventsDataReceiver } from "./eventsDataReceiver";
import { EventsDataReceiverBase } from "./eventsDataReceiverBase";
import { RMQConnectionParameters } from "../common/rmqServiceBase";
import { Bet365Event, EventMarket, ObjectProxyChangeDetector, ProxyFactory } from "../models/Bet365Event";
import { RedisClient } from "../common/redis/redisClient";
const fs = require('fs');
const Stopwatch = require('statman-stopwatch');

// https://www.npmjs.com/package/statman-stopwatch
// https://gomakethings.com/how-to-get-the-value-of-an-object-from-a-specific-path-with-vanilla-js/
export class EventsListManager extends EventsDataReceiverBase {

    static readonly redisHost = "127.0.0.1";
    static readonly redisPort = 6379;
    static readonly rmqServerUrl = "amqp://localhost";
    static readonly exchangeName = "ofer_test2";
    static readonly internalSocketPort = 1234;
    static readonly maxEventsInDataReceiver = 25;

    activeEvents = new Map();
    eventsDataReceivers: IEventsDataReceiver[] = [];
    producerService: RMQProducerService;
    consumerService: RMQConsumerService;
    runningEvents = new Map();

    
    constructor(protected browserManager: IBrowserManager) {
        super(browserManager, EventsListManager.internalSocketPort);

        // const redisClient: RedisClient = new RedisClient(EventsListManager.redisHost, EventsListManager.redisPort);
        // console.log(redisClient.ready);

        // redisClient.get("Ofer").then((data) => {
        //     console.log(data);
        // });

        // this.readEventFromFile();
        // const connectionParams: RMQConnectionParameters = new RMQConnectionParameters(EventsListManager.rmqServerUrl, true, false);
        // this.consumerService = new RMQConsumerService(connectionParams);
        // this.consumerService.consumeFromExchange(EventsListManager.exchangeName, this.onRmqDataArrived);
        // this.producerService = new RMQProducerService(connectionParams);
        // this.producerService.start().then(data => {
        //     console.log("Successfully connected to rabbit mq!!!");
        // });
    }


    private readEventFromFile() {
        let rawdata = fs.readFileSync("../data/6V95797129C1A_1_1.json");
        let eventDataInfo = JSON.parse(rawdata) as IEventDataInfo;
        
        const stopwatch = new Stopwatch();
        stopwatch.start();
        const bet365Event = ProxyFactory.CreateProxy<Bet365Event>(new Bet365Event(eventDataInfo));
        const bet365Event2 = ProxyFactory.CreateProxy<Bet365Event>(new Bet365Event(eventDataInfo));
        bet365Event2.markets.splice(1 ,1);
        const a = Object.assign({}, bet365Event.markets[1]) as EventMarket;
        a.id = 33302159;
        bet365Event2.markets.push(a);
        bet365Event.update(bet365Event2);
        stopwatch.stop();
        let delta = stopwatch.read();

        
        stopwatch.start();
        bet365Event.id = 3330215;
        bet365Event.markets[0].name = "ofer";
        bet365Event.markets[0].bets[0].id = 12345;
        console.log(bet365Event.getChanges());
        stopwatch.stop();
        delta = stopwatch.read();

        console.log(delta);
    }

    private onRmqDataArrived(message: string, rawMessage: any) {
        console.log(message);

        const stopwatch = new Stopwatch();
        stopwatch.start();

        let eventDataInfo = JSON.parse(message) as IEventDataInfo;
        if(eventDataInfo) {
            if(this.runningEvents.has(eventDataInfo.data.id)) {
                this.runningEvents[eventDataInfo.data.id].update(eventDataInfo);
            } else {
                const bet365Event = ProxyFactory.CreateProxy<Bet365Event>(new Bet365Event(eventDataInfo));
                this.runningEvents.set(bet365Event.id, bet365Event);
            }
        }
        
        stopwatch.stop();
        const delta = stopwatch.read();
    }

    public handleCommandInfo(command: ICommandInfo) {
        switch (command.command) {
            case "eventDataInfo": {

                const eventDataInfo = JSON.parse(command.payload) as IEventDataInfo;
                if (!eventDataInfo) {
                    debugger
                    return;
                }

                console.log(eventDataInfo.data.NA);
                //this.producerService.publishToExchange(EventsListManager.exchangeName, command.payload);

                if(this.runningEvents.has(eventDataInfo.data.id)) {
                    this.runningEvents[eventDataInfo.data.id].update(eventDataInfo);
                } else {
                    const bet365Event = ProxyFactory.CreateProxy<Bet365Event>(new Bet365Event(eventDataInfo));
                    this.runningEvents.set(bet365Event.id, bet365Event);
                }

                let data = JSON.stringify(eventDataInfo, null, 4);
                fs.writeFileSync(`${eventDataInfo.data.IT}.json`, data);
                break;
            }
            default: {
                break;
            }
        }
    }

    protected handleEventAdded(eventInfo: IEventInfo): Promise<void> {
        return new Promise<void>(async resolve => {
            if (this.eventsRouter.getId() !== eventInfo.browserId) {
                resolve();
                return;
            }

            if (this.activeEvents.has(eventInfo.id)) {
                resolve();
                return;
            }

            this.activeEvents.set(eventInfo.id, eventInfo);

            let dataReceiver = this.eventsDataReceivers.find(e => e.events.size <= EventsListManager.maxEventsInDataReceiver);
            if (dataReceiver == null) {
                const websocketPort = EventsListManager.internalSocketPort + this.eventsDataReceivers.length + 1;
                dataReceiver = new EventsDataReceiver(this.browserManager, websocketPort);
                await dataReceiver.start({
                    headless: false,
                    agentId: dataReceiver.id,
                    urls: ["https://www.bet365.com/#/HO/"],
                    injectionFiles: [
                        "dist/server/bet365Extractor.js"
                    ],
                    windowEnvironmentArgs: [
                        { name: "localSocketPort", value: `${websocketPort}` },
                        { name: "extractEvents", value: true }
                    ]
                });
                this.eventsDataReceivers.push(dataReceiver);
            }
            dataReceiver.addEvent(eventInfo);
            console.log(`eventAdded: this.activeEvents: ${this.activeEvents.size}`);
            resolve();
        });
    }

    protected handleEventRemoved(eventInfo: IEventInfo): Promise<void> {
        return new Promise<void>(async resolve => {
            if (this.eventsRouter.getId() !== eventInfo.browserId)
                return;

            if (!this.activeEvents.has(eventInfo.id))
                return;

            if (!this.activeEvents.delete(eventInfo.id)) {
                console.log(`Failed to delete: ${eventInfo.id}`);
            }

            let dataReceiver = this.eventsDataReceivers.find(e => e.hasEvent(eventInfo));
            if (dataReceiver != null) {
                dataReceiver.removeEvent(eventInfo);
            }

            console.log(`eventRemoved: this.activeEvents: ${this.activeEvents.size}`);
            resolve();
        });
    }
}
