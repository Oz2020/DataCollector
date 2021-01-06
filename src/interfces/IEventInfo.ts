
export interface IEventInfo {
    browserId: string;
    id: string;
    keepAliveWebsockerUrl: string;
    websockerUrl: string;
    websockerProtocol: string;
    handshakeMesage: string;
    C1: string;
    T1: string;
    C2: string;
    T2: string;
    sportId: string;
    loadLivescore: boolean;
}

export interface IEventDataInfo {
    browserId?: string;
    name: string;
    childrenCount: number;
    data: any;
    children: any[];
    isLivescore?: boolean;
    teamGroups?: any[];
    statGroups?: any[];
}