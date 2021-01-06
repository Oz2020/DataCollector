import amqp from 'amqplib/callback_api';

export class RMQConnectionParameters {
    constructor(
        public connectionUrl: string,
        public durable: boolean =  false,
        public exclusive: boolean = true,
        public autoAck: boolean = true,
        public ackOnError: boolean = true) {
    }
}

// https://www.npmjs.com/package/amqplib
// https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html

export abstract class RMQServiceBase {

    protected channel: any = null;

    constructor(protected ConnectionParameters: RMQConnectionParameters) {
        if (!ConnectionParameters || ConnectionParameters === null)
            throw new Error("ConnectionParameters is null or empty");


        if (!ConnectionParameters.connectionUrl || ConnectionParameters.connectionUrl.length === 0)
            throw new Error("ConnectionParameters.connectionUrl is null or empty");
    }

    protected connect(): Promise<string> {
        var self = this;
        return new Promise<string>((resolve, reject) => {
            try {
                amqp.connect(this.ConnectionParameters.connectionUrl, function (err, conn) {
                    if (err) {
                        reject(err);
                    }
                    conn.createChannel(function (err, channel) {
                        if (err) {
                            reject(err);
                        }
                        self.channel = channel;
                        resolve();
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
