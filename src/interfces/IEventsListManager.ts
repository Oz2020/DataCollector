import { IBrowserScarpingAgentConfiguration } from "./IBrowserScarpingAgentConfiguration";

export interface IEventsListManager {
    start(config: IBrowserScarpingAgentConfiguration): Promise<boolean>;
    stop(): Promise<boolean>;
}
