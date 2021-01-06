import * as redis from 'redis';

// https://github.com/NodeRedis/node-redis
export class RedisClient {

    sessionInstance: any;
    redisClient: any;

    public get ready(): boolean {
        return this.redisClient.ready;
    }

    constructor(host: string, port: number) {
        this.redisClient = redis.createClient({
            host: host,
            port: port,
            retry_strategy: function (options) {
                if (options.error && options.error.code === "ECONNREFUSED") {
                    // End reconnecting on a specific error and flush all commands with
                    // a individual error
                    return new Error("The server refused the connection");
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    // End reconnecting after a specific timeout and flush all commands
                    // with a individual error
                    return new Error("Retry time exhausted");
                }
                if (options.attempt > 10) {
                    // End reconnecting with built in error
                    return undefined;
                }
                // reconnect after
                return Math.min(options.attempt * 100, 3000);
            },
        });

        this.redisClient.on("error", function (error) {
            console.error(error);
        });
    }

    public get(key: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                this.redisClient.get(key, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    public set(key: string, value: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                this.redisClient.set(key, value, (err, data) => {
                    resolve(!err && data === "OK");
                });
            } catch (error) {
                console.error(error);
                reject(false);
            }
        });
    }
}