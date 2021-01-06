import { IBrowserManager, IBrowser, NavigationParameters } from "../interfces/IBrowserManager"
import { IBrowserScarpingAgent } from "../interfces/IBrowserScarpingAgent"
import { IBrowserScarpingAgentConfiguration } from "../interfces/IBrowserScarpingAgentConfiguration"

// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')())

export class BrowserScarpingAgent implements IBrowserScarpingAgent {
    isStarted: boolean = false;
    agentId: string;
    browsers: IBrowser[] = [];

    constructor(private browserManager: IBrowserManager) {
    }

    public start(config: IBrowserScarpingAgentConfiguration): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            try {
                if (!this.isStarted) {

                    if (config.agentId === null || config.agentId.length === 0) {
                        throw new Error("config.agentId is null or empty");
                    }

                    if (config.urls === null || config.urls.length === 0) {
                        throw new Error("config.urls is null or empty");
                    }

                    this.agentId = config.agentId

                    for (let index = 0; index < config.urls.length; index++) {
                        const url = config.urls[index];
                        const browser = await this.browserManager.createBrowser(config.headless, null);
                        this.browsers.push(browser);
                        const navigationsParameters: NavigationParameters = {
                            url
                        };
                        await browser.navigateToUrl(navigationsParameters);
                    }

                    this.isStarted = true;
                }

                resolve(true);
            } catch (error) {
                resolve(false);
            }
        });
    }

    public stop(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            try {
                console.info('disposing');
                for (let index = 0; index < this.browsers.length; index++) {
                    await this.browserManager.closeBrowser(this.browsers[index].id);
                }
                console.log('closed browsers');
                resolve(true);
            } catch (error) {
                resolve(false);
            }
        });
    }   
}