export interface EmailSender {
    send(params: EmailSender.Params): Promise<void>;
}

export namespace EmailSender {
    export type Params = {
        to: string;
        message: string;
    }
}