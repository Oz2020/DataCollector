import { EventManager } from "../server/eventManager";


export interface IConnectionEntry {
    id: string;
    instance: any;
    eventManagers: EventManager[];
}
