import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from './sqs/sqs.module';
import { SqsModuleConfig } from './sqs/sqs.types';
// import { QueueConsumerModule } from './queue-consumer/queue-consumer.module';

// const q1Config: SqsModuleConfig =  {
//   region: process.env.AWS_REGION || '',
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   queueUrl: process.env.SQS_QUEUE1_URL || '',
// };

// const q2Config: SqsModuleConfig =  {
//   region: process.env.AWS_REGION || '',
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   queueUrl: process.env.SQS_QUEUE2_URL || '',
// };

const q1ServiceToken: string = 'SQS_SERVICE_TEST1';
const q2ServiceToken: string = 'SQS_SERVICE_TEST2';
@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        envFilePath: ['.env'],
      },
    ),
    SqsModule.register(
      {
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        queueUrl: process.env.SQS_QUEUE1_URL || '',
        isConsumer: false,
      },
      q1ServiceToken,
    ),
    SqsModule.register(
      {
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        queueUrl: process.env.SQS_QUEUE2_URL || '',
        isConsumer: true,
      },
      q2ServiceToken,
      async (message) => {
        console.log('Received message from SQS Service 2:', message);
        // Handle the message here
        // For example, you can log it or process it further
      },
    ),
    // QueueConsumerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
