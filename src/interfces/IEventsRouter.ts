import { IEventInfo } from "./IEventInfo";

export interface ISocketListener {
    isMessageValid(eventInfo: IEventInfo) : boolean;
    eventAdded(eventInfo: IEventInfo);
    eventRemoved(eventInfo: IEventInfo);
    handleEventData(eventInfo: IEventDataInfo);
}


export interface IEventsRouter {
    getId(): string;
    
    start(websocketPort: number);
    stop();
    
    listenForMessages(socketListener: ISocketListener);

    send(message: ICommandInfo);
}

