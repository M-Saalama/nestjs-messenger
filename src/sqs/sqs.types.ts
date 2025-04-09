export interface SqsModuleConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    queueUrl: string;
}

export interface SqsMessage {
    message : Record<string, any>;
}