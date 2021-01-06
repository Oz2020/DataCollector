import { IEventInfo } from "./IEventInfo";
import { IEventsListManager } from "./IEventsListManager";

export interface IEventsDataReceiver extends IEventsListManager {
    events: Map<string, IEventInfo>;
    id: string;
    
    addEvent(eventInfo: IEventInfo);
    removeEvent(eventInfo: IEventInfo);
    hasEvent(eventInfo: IEventInfo): boolean
}