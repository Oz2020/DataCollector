import { IBrowserScarpingAgentConfiguration } from "./IBrowserScarpingAgentConfiguration";

export interface IBrowserScarpingAgent extends IScarpingAgent {
    start(config: IBrowserScarpingAgentConfiguration): Promise<boolean>;
    stop(): Promise<boolean>;
}
