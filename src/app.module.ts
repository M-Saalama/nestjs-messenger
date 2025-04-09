import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from './sqs/sqs.module';
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
      'SQS_SERVICE_TEST1',
    ),
    SqsModule.register(
      {
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        queueUrl: process.env.SQS_QUEUE2_URL || '',
      },
      'SQS_SERVICE_TEST2',
    ),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
