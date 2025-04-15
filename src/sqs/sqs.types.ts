export interface SqsModuleConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    queueUrl: string;
    isConsumer: boolean;
    numberOfMessages?: number;
}

export type SqsMessage = Record<string, any>;

export type SqsHandler = (message: SqsMessage) => Promise<void> | void;