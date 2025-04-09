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
    SqsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
