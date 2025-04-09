import { Injectable } from '@nestjs/common';
import { SqsModuleConfig } from './sqs.types';
import {
    SQSClient,
    SendMessageCommand,
    SendMessageBatchCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';
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
    async send(message: string) {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: message,
        });
        return this.sqsClient.send(command);
    }

    async sendBulk(messages: string[], queueUrl: string) {
        const entries: SendMessageBatchRequestEntry[] = messages.map((msg, index) => ({
            Id: `${index}`,
            MessageBody: msg,
        }));

        const command = new SendMessageBatchCommand({
            QueueUrl: queueUrl,
            Entries: entries,
        });

        return this.sqsClient.send(command);
    }

    async receive(queueUrl: string) {
        const command = new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 10,
        });

        const response = await this.sqsClient.send(command);
        return response.Messages?.[0];
    }

    async receiveBulk(queueUrl: string, maxMessages = 10) {
        const command = new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxMessages,
            WaitTimeSeconds: 10,
        });

        const response = await this.sqsClient.send(command);
        return response.Messages || [];
    }

    async delete(receiptHandle: string, queueUrl: string) {
        const command = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
        });

        return this.sqsClient.send(command);
    }

    printUrl() {
        console.log(this.queueConfig.queueUrl);
    }
}
