import { RMQConnectionParameters, RMQServiceBase } from './rmqServiceBase';

export class RMQProducerService extends RMQServiceBase {

    constructor(protected ConnectionParameters: RMQConnectionParameters) {
        super(ConnectionParameters);
    }

    public start(): Promise<string> {
        return super.connect();
    }

    public publishToExchange(exchangeName: string, data: string, routhingKey: string = ''): boolean {
        try {
            if (!exchangeName || exchangeName.length === 0)
                throw new Error("exchangeName is null or empty");

            this.channel.assertExchange(exchangeName, 'fanout', {
                durable: this.ConnectionParameters.durable
            });

            const result = this.channel.publish(exchangeName, routhingKey, Buffer.from(data));
            return result;
        } catch (error) {
            debugger
        }
    }

    public sendToQueue(queueName: string, data: string): boolean {
        try {
            if (!queueName || queueName.length === 0)
                throw new Error("queueName is null or empty");

            const result = this.channel.sendToQueue(queueName, Buffer.from(data));
            return result;
        } catch (error) {
            debugger
        }
    }

}