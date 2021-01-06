import { IBrowserManager } from "../interfces/IBrowserManager";
import { IEventInfo } from "../interfces/IEventInfo";
import { IEventsDataReceiver } from "../interfces/IEventsDataReceiver";
import { EventsDataReceiverBase } from "./eventsDataReceiverBase";

export class EventsDataReceiver extends EventsDataReceiverBase implements IEventsDataReceiver {

    events = new Map();

    constructor(protected browserManager: IBrowserManager, protected socketPort: number) {
        super(browserManager, socketPort);
    }

    public addEvent(eventInfo: IEventInfo) {
        // console.log(`addEvent: ${eventInfo.id}`);

        if(this.events.has(eventInfo.id)) return;

        this.events.set(eventInfo.id, eventInfo);

        this.eventsRouter.send({
            command: "subscribe",
            payload: JSON.stringify(eventInfo)
        });
    }

    public removeEvent(eventInfo: IEventInfo) {
        console.log(`removeEvent: ${eventInfo.id}`);
        
        if(!this.events.has(eventInfo.id)) return;
        
        this.events.delete(eventInfo.id);

        this.eventsRouter.send({
            command: "unsubscribe",
            payload: JSON.stringify(eventInfo)
        });
    }

    public hasEvent(eventInfo: IEventInfo): boolean {
        return this.events.has(eventInfo.id);
    }

    public handleEventData(eventInfo: IEventDataInfo) {
        console.log("handleEventData: ", eventInfo.data.NA);        
    }

    protected handleEventAdded(eventInfo: IEventInfo): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.eventsRouter.getId() !== eventInfo.browserId)
                return;

            if (this.events.has(eventInfo.id))
                return;

            this.events.set(eventInfo.id, eventInfo);
            // console.log(`eventAdded: this.activeEvents: ${this.events.size}`);
            resolve();
        });
    }

    protected handleEventRemoved(eventInfo: IEventInfo): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.eventsRouter.getId() !== eventInfo.browserId)
                return;

            if (!this.events.has(eventInfo.id))
                return;

            if (!this.events.delete(eventInfo.id)) {
                console.log(`Failed to delete: ${eventInfo.id}`);
            }

            // console.log(`eventRemoved: this.activeEvents: ${this.events.size}`);
            resolve();
        });
    }
}
