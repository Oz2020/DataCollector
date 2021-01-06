import express = require('express');
import bodyParser = require('body-parser');
var cors = require('cors')
import { AgentManager } from './agentManager';
import { BrowserManager } from './BrowserManager';
import { EventsListManager } from "./EventsListManager";
import { IBrowserScarpingAgentConfiguration } from '../interfces/IBrowserScarpingAgentConfiguration';
import { IAgentManager } from '../interfces/IAgentManager';
import { Bet365Event, IEventBet, IEventMarket, IFixtureInfo } from '../models/Bet365Event';
import { GetFixturesRequest, GetFixturesResponse } from '../models/request';

const PORT = 3100;
const browserManager = new BrowserManager();
const agentManager: IAgentManager = new AgentManager(browserManager);
const eventsListManager: EventsListManager = new EventsListManager(browserManager);

// Create a new express app instance
const app: express.Application = express();
var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors());
app.use(bodyParser.json(
    {
        limit: '10mb',
    }));

app.post('/fixtures/getAll', async (req, res) => {

    console.log('received setup request with body: ', req.body);

    const request = req.body as GetFixturesRequest;

    // for (let i = 1; i < 100; i++) {
    //     const f = {
    //         id: i,
    //         sportId: 1,
    //         sportName: "Football",
    //         homeTeam: "Barcelona",
    //         awayTeam: `Real-Madrid_${i}`,
    //         league: "Super-league",
    //         location: "Spain",
    //         score: "0-0",
    //         markets: [{
    //             id: 1,
    //             name: "Fulltime result",
    //             order: "0",
    //             isSuspended: false,
    //             bets: [{
    //                 id: 1,
    //                 name: "",
    //                 price: "",
    //                 line: "",
    //                 order: "1",
    //                 isSuspended: false,
    //             }]
    //         }]
    //     };

    //     rows.push(f);
    // };


    res.header("Access-Control-Allow-Origin", "*");

    var eventsValues = [...eventsListManager.runningEvents.values()];

    const filteredData = eventsValues.slice(request.TableModel.start, request.TableModel.start + request.TableModel.length);

    const response = new GetFixturesResponse();
    response.totalRecords = eventsValues.length;

    filteredData.forEach(event => {

        var e: IFixtureInfo = {
            id: event.id,
            sportId: event.sportId,
            sportName: event.sportName,
            location: event.location,
            league: event.league,
            homeTeam: event.homeTeam,
            awayTeam: event.awayTeam,
            score: event.score,
            markets: []
        };

        event.markets.forEach(market => {
            var m: IEventMarket = {
                id: market.id,
                name: market.name,
                order: market.order,
                isSuspended: market.isSuspended,
                bets: []
            };

            m.bets.forEach(bet => {
                const b: IEventBet = {
                    id: bet.id,
                    name: bet.name,
                    price: bet.price,
                    line: bet.line,
                    order: bet.order,
                    isSuspended: bet.isSuspended
                };
                m.bets.push(b);
            });
            e.markets.push(m);
        });

        response.fixtures.push(e);

    });

    res.send(response);

});


app.post('/agents/setup', async (req, res) => {

    console.log('received setup request with body: ', req.body);

    if (req.body.ClientId === null || req.body.ClientId.length === 0) {
        res.sendStatus(500).send('failed to get ClientId');
    }

    if (req.body.urls === null || req.body.urls.length) {
        res.sendStatus(500).send('failed to get urls list');
    }

    // Create config
    const config: IBrowserScarpingAgentConfiguration = {
        agentId: req.body.ClientId,
        headless: true,
        urls: []
    };

    for (let index = 0; index < req.body.urls.length; index++) {
        const url = req.body.urls[index];
        config.urls.push(url);
    }

    // Get or create agent
    let agent = agentManager.getAgent(req.body.ClientId);
    if (!agent) {
        agent = await agentManager.createAgent(config);
    }

    console.log('start agent with: ' + config);
    const result = await agent.start(config);
    if (result) {
        res.sendStatus(200);
        return;
    } else {
        res.sendStatus(500).send("FAiled to start agent");
    }
});

app.post('/events/data', async (req, res) => {
    try {
        const commandInfo = req.body as ICommandInfo
        if (commandInfo === null) {
            return res.sendStatus(400).send('request is not of type ICommandInfo');
        }

        eventsListManager.handleCommandInfo(commandInfo);
        return res.send(200);
    } catch (error) {
        return res.sendStatus(500).send(error.message);
    }
});

(async () => {
    console.info('running..');
    const config: IBrowserScarpingAgentConfiguration = {
        agentId: "Test id",
        headless: false,
        urls: [
            'https://www.bet365.com/#/HO/'
        ],
        injectionFiles: [
            "dist/server/bet365parser.js"
        ],
        windowEnvironmentArgs: [
            {
                name: "localSocketPort", value: "1234"
            }
        ]
    };

    // const agent: IBrowserScarpingAgent = new BrowserScarpingAgent(browserManager);

    await eventsListManager.start(config);
    console.info('finished..');
})();

app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}!`);
});

