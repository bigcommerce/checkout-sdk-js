export default interface AfterpaySdk {
    init(): void;
    display(options: AfterpayDisplayOptions): void;
}

interface AfterpayDisplayOptions {
    token: string;
}
