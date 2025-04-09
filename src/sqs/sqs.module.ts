import { Module , DynamicModule , Provider} from '@nestjs/common';
import { SqsModuleConfig } from './sqs.types';
import { SqsService } from './sqs.service';


@Module({})
export class SqsModule {
    static register(config: SqsModuleConfig , SqsServiceToken: string): DynamicModule {
        const sqsServiceProvide: Provider = {
                provide: SqsServiceToken,
                useFactory: () => new SqsService(config),
        };
        return {
            module: SqsModule,
            providers: [sqsServiceProvide],
            exports: [sqsServiceProvide],
        };
    }
}
