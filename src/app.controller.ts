import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from './sqs/sqs.service';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService , @Inject('SQS_SERVICE_TEST1') private readonly sqsService1: SqsService, @Inject('SQS_SERVICE_TEST2') private readonly sqsService2: SqsService) {
    const number = this.configService.get<number>('PORT');
    console.log('number', number);
  }

  @Get()
  getHello(): string {
    this.sqsService1.printUrl();
    this.sqsService2.printUrl();
    return "Hello World!";
  }
}
