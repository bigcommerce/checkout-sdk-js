declare namespace Afterpay {
    interface DisplayOptions {
        token: string;
    }

    interface Sdk {
        init(): void;
        display(token: DisplayOptions): void;
    }
}
