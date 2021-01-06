import { IAgentManager } from "../interfces/IAgentManager";
import { IBrowserManager } from "../interfces/IBrowserManager";
import { IBrowserScarpingAgent } from "../interfces/IBrowserScarpingAgent";
import { IBrowserScarpingAgentConfiguration } from "../interfces/IBrowserScarpingAgentConfiguration";
import { BrowserScarpingAgent } from "./browserScarpingAgent";

export class AgentManager implements IAgentManager {

    agents: { [id: string]: IBrowserScarpingAgent } = {};

    constructor(private browserManager: IBrowserManager) {
    }

    public async createAgent(config: IBrowserScarpingAgentConfiguration): Promise<IBrowserScarpingAgent> {
        let agent = this.agents[config.agentId];
        if (agent) { return agent; }

        agent = new BrowserScarpingAgent(this.browserManager);                
        this.agents[config.agentId] = agent;
        return agent;
    }

    public getAgent(clientId: string) {
        return this.agents[clientId];
    }
}