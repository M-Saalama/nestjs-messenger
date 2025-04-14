import { Injectable } from '@nestjs/common';
import { SqsModuleConfig , SqsMessage } from './sqs.types';
import {
    SQSClient,
    SendMessageCommand,
    SendMessageBatchCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';

// default queue region
const DEFAULT_REGION = 'us-east-1';
// default number of received messages
const DEFAULT_NUMBER_OF_MESSAGES = 1;
// max number of received messages allowed
const MAX_NUMBER_OF_MESSAGES = 50;
// wait 10 seconds if there is no messages
const DEFAULT_QUEUE_WAIT_TIME = 10;
// max sendBatch request size
const MAX_BATCH_REQUEST_SIZE = 262144;

@Injectable()
export class SqsService {
    private readonly sqsClient: SQSClient;
    private readonly queueUrl: string;

    constructor(private queueConfig: SqsModuleConfig) {
        this.queueConfig = queueConfig;
        this.sqsClient = new SQSClient({
            region: queueConfig.region,
            credentials: {
                accessKeyId: queueConfig.accessKeyId,
                secretAccessKey: queueConfig.secretAccessKey,
            },
        });
        this.queueUrl = queueConfig.queueUrl;
    }
    async send(sqsMessage: SqsMessage) {
        const message: string = JSON.stringify(sqsMessage.message);
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: message,
        });
        return this.sqsClient.send(command);
    }

    async sendBulk(SqsMessages: SqsMessage[]) {
        const messages: string[] = SqsMessages.map((msg) => JSON.stringify(msg.message));
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

    async receive(){
        const command = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: DEFAULT_NUMBER_OF_MESSAGES,
            WaitTimeSeconds: DEFAULT_QUEUE_WAIT_TIME,
        });
        const response = await this.sqsClient.send(command);
        if (response.Messages && response.Messages.length > 0) {
            const message = response.Messages[0];
            try {
                message.Body = message.Body ? JSON.parse(message.Body) : null;
            } catch (error) {
                throw new Error("Failed to parse SQS message body");
            }
            return message;
        }
        return null;
    }

    async receiveBulk(numberOfMessages: number = DEFAULT_NUMBER_OF_MESSAGES) {
        numberOfMessages = Math.min(numberOfMessages, MAX_NUMBER_OF_MESSAGES);
        const command = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: numberOfMessages,
            WaitTimeSeconds: 10,
        });

        const response = await this.sqsClient.send(command);
        if (response.Messages && response.Messages.length > 0) {
            response.Messages.forEach((message) => {
                try {
                    message.Body = message.Body ? JSON.parse(message.Body) : null;
                } catch (error) {
                    throw new Error("Failed to parse SQS message body");
                }
            });
            return response.Messages;
        }
        return null;
    }

    async delete(receiptHandle: string) {
        const command = new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
        });

        return this.sqsClient.send(command);
    }

    printUrl() {
        console.log(this.queueConfig.queueUrl);
    }
}
