export default interface AfterpaySdk {
    initialize(options: AfterpayInitializeOptions): void;
    redirect(options: AfterpayDisplayOptions): void;
}

export interface AfterpayDisplayOptions {
    token: string;
}

export interface AfterpayInitializeOptions {
    countryCode: string;
}
