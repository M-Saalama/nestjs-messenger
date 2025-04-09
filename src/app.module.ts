import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from './sqs/sqs.module';
import { SqsModuleConfig } from './sqs/sqs.types';

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
      },
      q1ServiceToken,
    ),
    SqsModule.register(
      {
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        queueUrl: process.env.SQS_QUEUE2_URL || '',
      },
      q2ServiceToken,
    ),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
