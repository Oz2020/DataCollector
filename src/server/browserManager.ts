import { IBrowserManager, IBrowser } from "../interfces/IBrowserManager";
import { Browser } from "./browser";
const puppeteer = require('puppeteer-extra');

export class BrowserManager implements IBrowserManager {
    browsers: IBrowser[] = [];

    public async createBrowser(headless: boolean, routerId: string): Promise<IBrowser> {
        return new Promise<IBrowser>(async (resolve, reject) => {
            console.info('launching puppeteer');
            try {
                const browserInstance = await puppeteer.launch({
                    headless: headless,
                    ignoreHTTPSErrors: true,
                    devtools: true,
                    args: [
                        '--disable-web-security',
                        '--no-sandbox',
                        '--unsafely-treat-insecure-origin-as-secure=http://127.0.0.1,http://endpoint,http://127.0.0.1:5003,http://localhost:5003',
                        '--proxy-bypass-list=<-loopback>',
                        ' --disable-infobars',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--no-zygote',
                        '--use-gl=desktop',
                        '--disable-gpu',
                        '--ignore-certificate-errors',
                        '--ignore-certificate-errors-spki-list',
                        '--mute-audio',
                        '--enable-features=NetworkService',
                    ]
                });

                if(routerId === null) {
                    routerId = `browser_${this.browsers.length}`;
                }

                const browser: IBrowser = new Browser(browserInstance, routerId);
                this.browsers.push(browser);
                resolve(browser);
            } catch (error) {
                reject(error);
            }
        });
    }

    public closeBrowser(browserId: string) {
        const index = this.browsers.findIndex(b => b.id === browserId);
        if (index === -1)
            return;

        this.browsers.splice(index, 1);
    }
}
