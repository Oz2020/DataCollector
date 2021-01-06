import { RMQConnectionParameters, RMQServiceBase } from './rmqServiceBase';

export interface IRMQConsumeNotification {
    (message: string, rawMessage: any): void;
}

export class RMQConsumerService extends RMQServiceBase {

    constructor(protected ConnectionParameters: RMQConnectionParameters) {
        super(ConnectionParameters);
    }

    public async consumeFromQueue(
        queueName: string,
        onConsumeFun: IRMQConsumeNotification) {

        if (!queueName || queueName.length === 0)
            throw new Error("queueName is null or empty");

        const result = await super.connect();
        if (result)
            throw new Error(result);

        const self = this;
        this.channel.assertQueue(queueName, {
            exclusive: self.ConnectionParameters.exclusive,
            durable: self.ConnectionParameters.durable,
        }, function (error2, q) {
            if (error2) {
                throw error2;
            }
            console.log(`connected to ${q.queue}`, q.queue);

            self.channel.consume(q.queue, function (msg) {
                try {
                    if (msg.content) {
                        onConsumeFun(msg.content.toString(), msg);
                        if (self.ConnectionParameters.autoAck) {
                            self.channel.ack(msg);
                        }
                    }
                } catch (error) {
                    debugger;
                    if (self.ConnectionParameters.ackOnError) {
                        self.channel.ack(msg);
                    }
                }
            }, {
                noAck: false
            });
        });
    }

    public async consumeFromExchange(
        exchangeName: string,
        onConsumeFun: IRMQConsumeNotification): Promise<string> {

        try {
            if (!exchangeName || exchangeName.length === 0)
                throw new Error("queueName is null or empty");

            const result = await super.connect();
            if (result)
                throw new Error(result);

            const self = this;
            if (exchangeName) {
                this.channel.assertQueue('', {
                    exclusive: self.ConnectionParameters.exclusive,
                    durable: self.ConnectionParameters.durable,
                }, async function (error2, q) {
                    if (error2) {
                        throw error2;
                    }
                    console.log(`${exchangeName} connected to ${q.queue}`, q.queue);
                    
                    self.channel.assertExchange(exchangeName, 'fanout', {
                        durable: self.ConnectionParameters.durable
                    });
                    
                    self.channel.bindQueue(q.queue, exchangeName, '');

                    self.channel.consume(q.queue, function (msg) {
                        try {
                            if (msg.content) {
                                onConsumeFun(msg.content.toString(), msg);
                                if (self.ConnectionParameters.autoAck) {
                                    self.channel.ack(msg);
                                }
                            }
                        } catch (error) {
                            debugger;
                            if (self.ConnectionParameters.ackOnError) {
                                self.channel.ack(msg);
                            }
                        }
                    }, {
                        noAck: false
                    });
                });
            }
            return result;
        } catch (error) {
            debugger
        }
    }

    public Ack(message) {
        this.channel.ack(message);
    }
}
