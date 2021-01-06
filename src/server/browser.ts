import { IBrowser, NavigationParameters } from "../interfces/IBrowserManager";
const fs = require('fs');

export class Browser implements IBrowser {

    id: string;

    constructor(private browser: any, id: string) {
        if (browser === null) {
            throw new Error("browser is null");
        }
        if (id === null || id.length === 0) {
            throw new Error("id is null or empty");
        }
        this.browser = browser;
        this.id = id;
    }

    public navigateToUrl(navigationsParameters: NavigationParameters): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                if (!this.browser) {
                    reject("browser is not ready");
                    return false;
                }

                if (!navigationsParameters.url) {
                    reject("url is null or empty!");
                    return false;
                }

                let page = null;
                let pages = await this.browser.pages();
                if (pages.length > 0) {
                    page = pages[0];
                } else {
                    page = await this.browser.newPage();
                }

                console.log('start loading url ', navigationsParameters.url);
                await page.goto(navigationsParameters.url, { waitUntil: 'networkidle0', timeout: 40000 });
                console.log('finished loading url');

                await page.evaluate((data) => {
                    var win = window as any;
                    win.document.browserId = data;
                }, this.id);

                if (navigationsParameters.windowEnvironmentArgs && navigationsParameters.windowEnvironmentArgs.length > 0) {
                    for (let index = 0; index < navigationsParameters.windowEnvironmentArgs.length; index++) {

                        const arg = navigationsParameters.windowEnvironmentArgs[index];

                        await page.evaluate((arg) => {
                            var win = window as any;
                            win.document[arg.name] = arg.value;
                        }, arg);
                    }
                }

                if (navigationsParameters.injectionFiles !== null && navigationsParameters.injectionFiles.length > 0) {
                    for (let index = 0; index < navigationsParameters.injectionFiles.length; index++) {
                        const injectionFile = navigationsParameters.injectionFiles[index];
                        await page.addScriptTag({ "path": injectionFile });
                    }
                }

                if (navigationsParameters.supressDialogs) {
                    page.on('dialog', async (dialog) => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                    });
                }

                resolve(true);
            }
            catch (error) {
                console.error('Unexpected error in setup: ', error.message);
                reject(error.message);
            }
        });
    }

    public loadPageContent(page: any, url: string): Promise<string> {

        return new Promise<string>(async (resolve, reject) => {
            try {
                console.log(`start request to url ${url}`);
                var response = await page.evaluate(async (url) => {
                    try {
                        // @ts-ignore
                        const result = await window.BridgeTest.getPageContent(url);
                        return result;
                    }
                    catch (error) {
                        console.log('error downloading!!');
                    }
                }, url);

                console.info(`finished request to url ${url}`);
                resolve(response);
            }
            catch (error) {
                console.error('Unexpected error in loadPageContent: ', error.message);
                reject(error.message);
            }
        });

    }


}
