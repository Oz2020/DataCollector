import { textChangeRangeIsUnchanged } from "typescript";


export class ObjectProxyChangeDetector implements ProxyHandler<any> {

    protected changes: { [id: string]: any; } = {};
    public object: any;
    protected children: ObjectProxyChangeDetector[] = [];

    constructor(protected keyName: string, protected parentChangeDetector: ObjectProxyChangeDetector = null) {
        if (parentChangeDetector) {
            parentChangeDetector.addChild(this);
        }
    }

    public addChild(child: ObjectProxyChangeDetector) {
        this.children.push(child);
    }

    public getChanges(): any {

        const newChanges = [];

        // Get my children changes
        this.children.forEach(x => {
            x.getChanges().forEach(element => {
                newChanges.push(element);
            });
        });

        for (let key in this.changes) {
            let value = this.changes[key];
            const name = `${this.getName()}.${key}`;
            newChanges.push({
                name,
                value
            });
        }
        return newChanges;
    }

    public getName(): string {
        const name = this.parentChangeDetector ? `${this.parentChangeDetector.getName()}.${this.keyName}` : this.keyName;
        return this.trimLeft(name, ".");
    }

    public get(target: any, prop: string, receiver): any {
        return target[prop];
    }

    public set(target: any, prop: string, newValue: any): any {
        const oldValue = target[prop];

        if (oldValue !== newValue) {
            target[prop] = newValue;
            this.changes[prop] = {
                oldValue,
                newValue
            };
        }

        return { ...newValue };
    }

    private trimLeft(str, charlist) {
        if (charlist === undefined)
            charlist = "\s";

        return str.replace(new RegExp("^[" + charlist + "]+"), "");
    };
}

export class ProxyFactory {
    public static CreateProxy<T extends ProxyHandler<any>>(t: T): T {
        return new Proxy(t, t);
    }
}

export interface IFixtureInfo {
    id: number;
    sportId: number;
    sportName: string;
    location: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    score: string;

    markets: IEventMarket[];
}

export interface IEventMarket {
    id: number;
    name: string;
    order: string;
    isSuspended: boolean;
    bets: IEventBet[];
}

export interface IEventBet {
    id: number;
    name: string;
    price: string;
    line: string;
    order: string;
    isSuspended: boolean;
}

export class SportNamesHelper {

    private static sportsMap = null;

    static instance() {
        if(this.sportsMap != null) return this;

        const defaultSpliter = ["vs", " v "];
        this.sportsMap = new Map();
        this.sportsMap.set("1", {
            name: "Soccer",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("2", {
            name: "Horse Racing",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("3", {
            name: "Cricket",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("4", {
            name: "Greyhounds",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("7", {
            name: "Golf",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("8", {
            name: "Rugby Union",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("9", {
            name: "Boxing/UFC",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("10", {
            name: "Formula 1",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("12", {
            name: "American Football",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("13", {
            name: "Tennis",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("14", {
            name: "Snooker",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("15", {
            name: "Darts",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("16", {
            name: "Baseball",
            spliter: [...defaultSpliter, "@"]
        });
        this.sportsMap.set("17", {
            name: "Ice Hockey",
            spliter: [...defaultSpliter, "@"]
        });
        this.sportsMap.set("18", {
            name: "Basketball",
            spliter: [...defaultSpliter, "@"]
        });
        this.sportsMap.set("19", {
            name: "Rugby League",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("24", {
            name: "Speedway",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("27", {
            name: "Motorbikes",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("38", {
            name: "Cycling",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("65", {
            name: "Nascar",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("75", {
            name: "Gaelic Sports",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("78", {
            name: "Handball",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("83", {
            name: "Futsal",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("88", {
            name: "Trotting",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("89", {
            name: "Bandy",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("90", {
            name: "Floorball",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("91", {
            name: "Volleyball",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("92", {
            name: "Table Tennis",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("94", {
            name: "Badminton",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("95", {
            name: "Beach Volleyball",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("98", {
            name: "Curling",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("110", {
            name: "Water Polo",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("113", {
            name: "Sailing",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("114", {
            name: "Supercars",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("118", {
            name: "Alpine Skiing",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("119", {
            name: "Biathlon",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("122", {
            name: "Cross Country Skiing",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("123", {
            name: "Ski Jumping",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("147", {
            name: "Netball",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("148", {
            name: "Surfing",
            spliter: [...defaultSpliter]
        });
        this.sportsMap.set("151", {
            name: "E-Sports",
            spliter: [...defaultSpliter]
        });

        console.log("Calling SportNamesHelper*************************");
        return this;
    }

    public static getSport(sportId: string) {
        if (!this.sportsMap.has(sportId)) {
            return {
                name: sportId,
                spliter: []
            };
        }

        return this.sportsMap.get(sportId);
    }

    public static extractPartiticpantsName(spliter: [], fullName: string) {
        if (spliter.length === 0) {
            return {
                home: fullName,
                away: "",
            }
        }

        for(var index = 0; index < spliter.length; index++) {

            const names = fullName.toLocaleLowerCase().split(spliter[index]);
            if (names.length === 2) {
                return {
                    home: names[0],
                    away: names[1],
                }
            }

        }

        return {
            home: fullName,
            away: "",
        }
    }
}


export class Bet365Event extends ObjectProxyChangeDetector implements IFixtureInfo {

    public id: number;
    public sportId: number;
    public sportName: string;
    public location: string;
    public league: string;
    public homeTeam: string;
    public awayTeam: string;
    public score: string;

    public markets: EventMarket[] = [];

    constructor(eventDataInfo: IEventDataInfo) {
        super('');

        const sportInfo = SportNamesHelper.instance().getSport(eventDataInfo.data.CL);
        const partiticpantsName = SportNamesHelper.instance().extractPartiticpantsName(sportInfo.spliter, eventDataInfo.data.NA);

        this.id = eventDataInfo.data.IT;
        this.sportId = eventDataInfo.data.CL;
        this.sportName = sportInfo.name;
        this.location = eventDataInfo.data.IT;
        this.league = eventDataInfo.data.CT;
        this.homeTeam = partiticpantsName.home;;
        this.awayTeam = partiticpantsName.away;
        this.score = eventDataInfo.data.SS;

        for (var index = 0; index < eventDataInfo.children.length; index++) {
            const child = eventDataInfo.children[index];
            const keyName = `markets[${index}]`;
            const marketProxy = ProxyFactory.CreateProxy<EventMarket>(new EventMarket(keyName, child, this));
            this.markets.push(marketProxy);
        }
    }

    public update(bet365Event: Bet365Event) {
        this.id = bet365Event.id;
        this.sportId = bet365Event.sportId;
        this.sportName = "";//bet365Event.sportName;
        this.location = bet365Event.location;
        this.league = bet365Event.league;
        this.homeTeam = bet365Event.homeTeam;
        this.awayTeam = bet365Event.awayTeam;
        this.score = bet365Event.score;


        let removedMarkets = this.filterRemoved(this.markets, bet365Event.markets, (x, y) => {
            return y.id === x.id;
        })

        let newMarkets = this.filterNew(bet365Event.markets, this.markets, (x, y) => {
            return y.id === x.id;
        });

        // let newMarkets = bet365Event.markets.filter(x => {
        //     const index = this.markets.findIndex(y=> y.id === x.id);
        //     return index === -1;
        // });

        let sameMarkets = bet365Event.markets.filter(x => {
            const index = this.markets.findIndex(y => y.id === x.id);
            return index !== -1;
        });

        for (var index = 0; index < sameMarkets.length; index++) {
            const child = bet365Event.markets[index];
            this.markets[index].update(child);
        }
    }

    private filterRemoved(source: any[], destination: any[], predicate) {
        const result = source.filter(x => {
            const index = destination.findIndex(y => predicate(y, x));
            return index === -1;
        });

        return result;
    }

    private filterNew(source: any[], destination: any[], predicate) {
        const result = source.filter(x => {
            const index = destination.findIndex(y => predicate(y, x));
            return index === -1;
        });

        return result;
    }





}


export class EventMarket extends ObjectProxyChangeDetector implements IEventMarket {

    public id: number;
    public name: string;
    public order: string;
    public isSuspended: boolean;
    public bets: EventBet[] = [];


    constructor(protected keyName: string, childData: IEventDataInfo, protected parentChangeDetector: ObjectProxyChangeDetector) {
        super(keyName);
        this.parentChangeDetector.addChild(this);

        parentChangeDetector.object = this;
        this.id = childData.data.IT;
        this.name = childData.data.NA;
        this.order = childData.data.OR;
        this.isSuspended = childData.data.SU;

        this.extractBets(childData.children);
    }

    public update(eventMarket: EventMarket) {

    }

    private extractBets(children: any) {
        if (children.length === 0) return [];

        if (children[0].name !== "PA") {
            return this.extractBets(children[0].children);
        }

        for (var index = 0; index < children.length; index++) {
            const child = children[index];
            const keyName = `bets[${index}]`;
            const betProxy = ProxyFactory.CreateProxy<EventBet>(new EventBet(keyName, child, this));
            this.bets.push(betProxy);
        }
    }

}

export class EventBet extends ObjectProxyChangeDetector implements IEventBet {
    public id: number;
    public name: string;
    public price: string;
    public line: string;
    public order: string;
    public isSuspended: boolean;

    constructor(protected keyName: string, childData: IEventDataInfo, protected parentChangeDetector: ObjectProxyChangeDetector) {
        super(keyName);
        this.parentChangeDetector.addChild(this);

        this.id = childData.data.IT;
        this.name = childData.data.NA;
        this.line = childData.data.N2;
        this.price = childData.data.OD;
        this.order = childData.data.OR;
        this.isSuspended = childData.data.SU;
    }
}