import { Injectable } from '@nestjs/common';
import { SqsModuleConfig } from './sqs.types';
@Injectable()
export class SqsService {
    constructor(private queueConfig: SqsModuleConfig) {
        this.queueConfig = queueConfig;
    }
    printUrl() {
        console.log(this.queueConfig.queueUrl);
    }
}
