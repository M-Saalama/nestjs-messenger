import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {
    const number = this.configService.get<number>('PORT');
    console.log('number', number);
  }

  @Get()
  getHello(): string {
    return "Hello World!";
  }
}
