import { Injectable, OnModuleInit } from '@nestjs/common';
import { SqsModuleConfig , SqsMessage , SqsHandler } from './sqs.types';
import {
    SQSClient,
    SendMessageCommand,
    SendMessageBatchCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';

// default number of received messages
const DEFAULT_NUMBER_OF_MESSAGES = 1;
// max number of received messages allowed
const MAX_NUMBER_OF_MESSAGES = 50;
// wait 10 seconds if there is no messages
const DEFAULT_QUEUE_WAIT_TIME = 10;

@Injectable()
export class SqsService implements OnModuleInit {
    private readonly sqsClient: SQSClient;
    private readonly queueUrl: string;

    constructor(private queueConfig: SqsModuleConfig  , private consumerHandler: SqsHandler) {
        this.queueConfig = queueConfig;
        this.consumerHandler = consumerHandler;
        this.sqsClient = new SQSClient({
            region: queueConfig.region,
            credentials: {
                accessKeyId: queueConfig.accessKeyId,
                secretAccessKey: queueConfig.secretAccessKey,
            },
        });
        this.queueUrl = queueConfig.queueUrl;
    }

    async onModuleInit() {
        if(this.queueConfig.isConsumer) {
            while (true) {
                try {
                    await this.pollQueue(DEFAULT_NUMBER_OF_MESSAGES, this.consumerHandler);
                } catch (error) {
                    console.error('Error polling queue:', error);
                }
            }
        }
    }

    async send(sqsMessage: SqsMessage) {
        const message: string = JSON.stringify(sqsMessage);
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: message,
        });
        return this.sqsClient.send(command);
    }

    async sendBulk(SqsMessages: SqsMessage[]) {
        const messages: string[] = SqsMessages.map((msg) => JSON.stringify(msg));
        const entries: SendMessageBatchRequestEntry[] = messages.map((msg, index) => ({
            Id: `${index}`,
            MessageBody: msg,
        }));

        const command = new SendMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: entries,
        });

        return this.sqsClient.send(command);
    }

    // async receive(): Promise<SqsMessage>{
    //     const command = new ReceiveMessageCommand({
    //         QueueUrl: this.queueUrl,
    //         MaxNumberOfMessages: DEFAULT_NUMBER_OF_MESSAGES,
    //         WaitTimeSeconds: DEFAULT_QUEUE_WAIT_TIME,
    //     });
    //     const response = await this.sqsClient.send(command);
    //     if (response.Messages && response.Messages.length > 0 && response.Messages[0].Body) {
    //         const message = response.Messages[0].Body;
    //         try {

    //             let parsedMessage: SqsMessage= JSON.parse(message);
    //             return parsedMessage;
    //         } catch (error) {
    //             throw new Error("Failed to parse SQS message body");
    //         }
    //     }
    //     else{
    //         throw new Error("No messages in the queue");
    //     }
    // }

    async receive(numberOfMessages: number = DEFAULT_NUMBER_OF_MESSAGES){
        if(numberOfMessages < 1 || numberOfMessages > MAX_NUMBER_OF_MESSAGES) {
            throw new Error(`numberOfMessages must be between 1 and ${MAX_NUMBER_OF_MESSAGES}`);
        }
        const command = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: numberOfMessages,
            WaitTimeSeconds: 10,
        });

        const response = await this.sqsClient.send(command);
        const validMessages: Record<string, any>[]= [];
        if (response.Messages && response.Messages.length > 0) {
            response.Messages.forEach((message) => {
                if (message.Body) {
                    try{
                        message.Body = JSON.parse(message.Body);
                        validMessages.push(message);
                    } catch (error) {
                        console.error("Failed to parse SQS message body", error);
                    }
                }
            });
        }
        return validMessages;
    }

    async delete(receiptHandle: string) {
        const command = new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
        });

        return this.sqsClient.send(command);
    }

    async pollQueue(numberOfMessages:number ,handler: SqsHandler) {
        try {
            const messages = await this.receive(numberOfMessages);
            if (messages.length > 0) {
                for (const message of messages) {
                    const messageBody: SqsMessage = message.Body;
                    handler(messageBody);
                    await this.delete(message.ReceiptHandle);
                }
            } 
        } catch (error) {
            throw new Error(`Error receiving messages: ${error}`);
        }
    }

    printUrl() {
        console.log(this.queueConfig.queueUrl);
    }
}
