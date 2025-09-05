export interface Sentry {
    captureMessage(message: string): void;
}

export interface SentryWindow extends Window {
    Sentry?: Sentry;
}
