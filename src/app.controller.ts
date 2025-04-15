import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from './sqs/sqs.service';
import { SqsMessage } from './sqs/sqs.types';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService , @Inject('SQS_SERVICE_TEST1') private readonly sqsService1: SqsService, @Inject('SQS_SERVICE_TEST2') private readonly sqsService2: SqsService) {
    // const number = this.configService.get<number>('PORT');
    // console.log('number', number);
  }

  @Get()
  getHello(): string {
    // this.sqsService1.printUrl();
    // this.sqsService2.printUrl();
    this.sqsService1.send(
      {name: 'message1'},
    );
    this.sqsService2.send(
      { message: { name: 'Hello from SQS Service 2' } },
    );
    this.sqsService1.receive().then((msg) => {
      console.log('Received message from SQS Service 1:', msg);
    });
    this.sqsService2.receive().then((msg) => {
      console.log('Received message from SQS Service 2:', msg);
    });
    // this.sqsService1.execute();
    return "Hello World!";
  }

  @Get('send')
  async sendMessage() {
    const message1: SqsMessage = { name: 'message1' };
    const message2: SqsMessage = { name: 'message2' };
    const message3: SqsMessage = { name: 'message3' };
    const message4: SqsMessage = { name: 'message4' };
    await this.sqsService1.send(message1);
    await this.sqsService1.send(message2);
    await this.sqsService1.send(message3);
    await this.sqsService1.send(message4);

    await this.sqsService2.send(message1);
    await this.sqsService2.send(message2);
    await this.sqsService2.send(message3);
    await this.sqsService2.send(message4);

    return 'Message sent to SQS Service 1';
  }

  // @Get('receive')
  // async receiveMessage() {
  //   const message1: SqsMessage = await this.sqsService1.receive();
  //   const message2:  = await this.sqsService2.receive();
  //   return {
  //     message1,
  //     message2,
  //   };
  // }
  @Get('receive')
  async receiveBulkMessage() {
    const messages1: SqsMessage[] = await this.sqsService1.receive(2);
    const messages2: SqsMessage[] = await this.sqsService2.receive(2);
    return {
      messages1,
      messages2,
    };
  }
}
