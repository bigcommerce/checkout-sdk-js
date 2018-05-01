export default interface AfterpaySdk {
    init(): void;
    display(options: AfterpayDisplayOptions): void;
}

export interface AfterpayDisplayOptions {
    token: string;
}
