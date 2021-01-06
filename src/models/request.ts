import { IFixtureInfo } from "./Bet365Event";

export class BaseRequest {
    public customerId?: number;
}

export class MetadataFilterCriteria {
    From?: Date;
    To?: Date;
    SportIds?: number[] = [];
    LocationIds?: number[] = [];
    LeagueIds?: number[] = [];
}

export class LeagueFilterCriteria extends MetadataFilterCriteria {
}

export class TableFilterModel {
    start: number;
    length: number;
    columns?: ColumnType[];
    columnsSearch?: ColumnSearch[];
    columnsOrder?: ColumnOrder[];
    search?: string;
}

export class ColumnType {
    name: string;
    search?: string;
    direction?: string;
}

export class ColumnSearch {
    column: string;
    search: string;
}

export class ColumnOrder {
    column: string;
    direction: string;
}


export class GetFixturesRequest extends BaseRequest {
    Filter: LeagueFilterCriteria;
    TableModel: TableFilterModel;
}


export class GetFixturesResponse {
    totalRecords: number;
    fixtures: IFixtureInfo[] = [];
}