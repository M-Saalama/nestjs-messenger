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
            MaxNumberOfMessages: 1,
        });
        const response = await this.sqsClient.send(command);
        // console.log('response', response);
        if(response.Messages && response.Messages[0].Body)
            response.Messages[0].Body = JSON.parse(response.Messages[0].Body);
        return response.Messages?.[0];
    }

    async receiveBulk(maxMessages = 10) {
        const command = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: maxMessages,
            WaitTimeSeconds: 10,
        });

        const response = await this.sqsClient.send(command);
        return response.Messages || [];
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
