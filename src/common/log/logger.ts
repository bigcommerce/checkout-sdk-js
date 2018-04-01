export default interface Logger {
    log(...messages: any[]): void;

    info(...messages: any[]): void;

    warn(...messages: any[]): void;

    error(...messages: any[]): void;

    debug(...messages: any[]): void;
}
