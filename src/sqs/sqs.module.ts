import { Module , DynamicModule} from '@nestjs/common';
import { SqsModule as SqsLibModule } from '@ssut/nestjs-sqs';
import { SqsService } from './sqs.service';
// import * as AWS from 'aws-sdk';


export interface QueueConfig {
    name: string;
    queueUrl: string;
    consumer: boolean;
  }
  
  export interface AWSConfig {
    region: string;
    queuesAccessKeyId: string;
    queuesSecretAccessKey: string;
  }

@Module({})
export class SqsModule {
    static forRootAsync(queues: QueueConfig[] , 
        awsConfig: AWSConfig) : DynamicModule {
        // AWS.config.update({
        //     region: queuesSecrets.region,
        //     accessKeyId: queuesSecrets.accessKeyId,
        //     secretAccessKey: queuesSecrets.secretAccessKey,
        // });
        return {
            module: SqsModule,
            imports: [
                // SqsLibModule.register({
                //     consumers: queuesConfig.filter(queue => queue.consumer).map(queue => ({
                //         name: queue.name,
                //         queueUrl: queue.queueUrl,
                //     })),
                //     producers: queuesConfig.filter(queue => !queue.consumer).map(queue => ({
                //         name: queue.name,
                //         queueUrl: queue.queueUrl,
                //     })),
                // }),
                SqsLibModule.registerAsync({
                    useFactory: () => ({
                        region: awsConfig.region,
                        credentials: {
                          accessKeyId: awsConfig.queuesAccessKeyId,
                          secretAccessKey: awsConfig.queuesSecretAccessKey,
                        },
                        consumers: queues.filter(queue => queue.consumer).map(queue => ({
                            name: queue.name,
                            queueUrl: queue.queueUrl,
                        })),
                        producers: queues.filter(queue => !queue.consumer).map(queue => ({
                            name: queue.name,
                            queueUrl: queue.queueUrl,
                        })),
                    }),
                }),
            ],
            providers: [SqsService],
            exports: [SqsService],
        };
    }
}
