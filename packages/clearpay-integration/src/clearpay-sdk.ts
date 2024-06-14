export default interface ClearpaySdk {
    initialize(options: ClearpayInitializeOptions): void;
    redirect(options: ClearpayDisplayOptions): void;
}

export interface ClearpayDisplayOptions {
    token: string;
}

export interface ClearpayInitializeOptions {
    countryCode: string;
}
