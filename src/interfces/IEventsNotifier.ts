import { IEventInfo } from "./IEventInfo";

export interface IEventsNotifier {
    eventAdded(event: IEventInfo);
    eventRemoved(event: IEventInfo);
}
