import { IBrowserScarpingAgent } from "./IBrowserScarpingAgent";
import { IBrowserScarpingAgentConfiguration } from "./IBrowserScarpingAgentConfiguration";

export interface IAgentManager {
    createAgent(config: IBrowserScarpingAgentConfiguration): Promise<IBrowserScarpingAgent>;
    getAgent(clientId: string);
}

