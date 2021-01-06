// const useProxy = require('puppeteer-page-proxy');

export class windowEnvironmentArg {
    public name: string;
    public value: any;
}

export class NavigationParameters {
    public url: string;
    public injectionFiles?: string[];
    public supressDialogs?: boolean;

    public windowEnvironmentArgs?: windowEnvironmentArg[];
}

export interface IBrowser {
    id: string;
    navigateToUrl(navigationsParameters: NavigationParameters): Promise<boolean>;
    loadPageContent(page: any, url: string): Promise<string>;
}

export interface IBrowserManager {
    createBrowser(headless: boolean, routerId: string): Promise<IBrowser>;
    closeBrowser(browserId: string);
}
