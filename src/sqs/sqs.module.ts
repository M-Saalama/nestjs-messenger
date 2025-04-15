import { Module , DynamicModule , Provider} from '@nestjs/common';
import { SqsModuleConfig , SqsHandler , SqsMessage} from './sqs.types';
import { SqsService } from './sqs.service';
// import { ConsumerService } from './consumer.service';

// const CONSUMER_SERVICE_TOKEN = 'QUEUE_CONSUMER_SERVICE';

@Module({})
export class SqsModule {
    static register(config: SqsModuleConfig , SqsServiceToken: string , consumerHandler: SqsHandler = (message: SqsMessage) => {}): DynamicModule {
        const sqsServiceProvide: Provider = {
                provide: SqsServiceToken,
                useFactory: () => new SqsService(config , consumerHandler),
        };
       
        return {
            module: SqsModule,
            providers: [sqsServiceProvide],
            exports: [sqsServiceProvide],
        };
    }
}
