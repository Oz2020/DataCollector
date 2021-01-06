import { windowEnvironmentArg } from "./IBrowserManager";

export interface IBrowserScarpingAgentConfiguration extends IScarpingAgentConfiguration {
    headless: boolean;
    urls: string[];
    injectionFiles?: string[];
    windowEnvironmentArgs?: windowEnvironmentArg[];
}
