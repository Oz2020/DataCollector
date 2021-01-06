// import { Subject } from "rxjs/internal/Subject";
import { Subject } from 'rxjs';
import { IBrowser, IBrowserManager, NavigationParameters } from "../interfces/IBrowserManager";
import { IBrowserScarpingAgentConfiguration } from '../interfces/IBrowserScarpingAgentConfiguration';
import { IEventInfo } from '../interfces/IEventInfo';
import { IEventsListManager } from '../interfces/IEventsListManager';
import { IEventsRouter, ISocketListener } from '../interfces/IEventsRouter';
import { EventsRouter } from "./eventsRouter";

export abstract class EventsDataReceiverBase implements IEventsListManager, ISocketListener {

    id: string;
    isStarted: boolean = false;
    browser: IBrowser;
    eventsRouter: IEventsRouter;
    addedEventsSubject: IEventInfo[] = [];
    removedEventsSubject: IEventInfo[] = []
    runningEvent: IEventInfo = null;

    constructor(
        protected browserManager: IBrowserManager, 
        protected internalSocketPort: number) {
            
        this.eventsRouter = new EventsRouter();
        this.id = this.eventsRouter.getId();
        this.loopInterval(1000);
    }

    public start(config: IBrowserScarpingAgentConfiguration): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            try {
                if (!this.isStarted) {

                    this.eventsRouter.start(this.internalSocketPort);
                    this.eventsRouter.listenForMessages(this);

                    if (config.urls === null || config.urls.length === 0) {
                        throw new Error("config.urls is null or empty");
                    }

                    for (let index = 0; index < config.urls.length; index++) {
                        const url = config.urls[index];
                        this.browser = await this.browserManager.createBrowser(config.headless, this.eventsRouter.getId());
                        const navigationsParameters: NavigationParameters = {
                            url,                            
                            supressDialogs: true                            
                        };

                        if(config.injectionFiles !== null && config.injectionFiles.length > 0) {
                            navigationsParameters.injectionFiles = config.injectionFiles;
                        } 

                        if(config.windowEnvironmentArgs !== null && config.windowEnvironmentArgs.length > 0) {
                            navigationsParameters.windowEnvironmentArgs = config.windowEnvironmentArgs;
                        } 

                        await this.browser.navigateToUrl(navigationsParameters);
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
                this.eventsRouter.stop();
                await this.browserManager.closeBrowser(this.browser.id);
                console.log('closed browsers');
                resolve(true);
            } catch (error) {
                resolve(false);
            }
        });
    }

    public isMessageValid(eventInfo: IEventInfo): boolean {
        if (eventInfo === null || !eventInfo.browserId || eventInfo.browserId.length == 0) return false;
        return eventInfo.browserId === this.browser.id;
    }

    public eventAdded(eventInfo: IEventInfo) {
        //if (this.eventsRouter.getId() !== eventInfo.browserId) return;

        if(!eventInfo.id || eventInfo.id.length === 0) {
            debugger;
        }

        this.addedEventsSubject.push(eventInfo);
    }

    public async eventRemoved(eventInfo: IEventInfo) {
        // if (this.eventsRouter.getId() !== eventInfo.browserId) return;

        if(!eventInfo.id || eventInfo.id.length === 0) {
            debugger;
        }
        
        this.removedEventsSubject.push(eventInfo);
    }

    public handleEventData(eventInfo: IEventDataInfo) {

    }

    protected abstract handleEventAdded(eventInfo: IEventInfo): Promise<void>;
    protected abstract handleEventRemoved(eventInfo: IEventInfo): Promise<void>;

    private loopInterval(loopInterval: number) {
        setInterval(async () => {
            try {
                if (this.runningEvent === null || this.runningEvent === undefined) {
                    this.runningEvent = this.addedEventsSubject.pop();
                    if (this.runningEvent != null) {
                        await this.handleEventAdded(this.runningEvent);
                        // console.log("handleEventAdded", this.runningEvent);
                        this.runningEvent = null;
                    } else {
                        this.runningEvent = this.removedEventsSubject.pop();
                        if (this.runningEvent != null) {
                            await this.handleEventRemoved(this.runningEvent);
                            // console.log("handleEventRemoved", this.runningEvent);
                            this.runningEvent = null;
                        }
                    }
                }
            } catch (error) {
                debugger
            }

        }, loopInterval);
    }
}