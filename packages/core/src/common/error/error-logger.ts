export interface ErrorLogger {
    log(error: Error): void;
}

export class DefaultErrorLogger implements ErrorLogger {
    log(error: Error): void {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}
