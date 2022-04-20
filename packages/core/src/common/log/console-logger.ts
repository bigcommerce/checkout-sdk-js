import Logger from './logger';

export default class ConsoleLogger implements Logger {
    constructor(
        private _console?: Console
    ) {}

    log(...messages: any[]): void {
        this._logToConsole('log', ...messages);
    }

    info(...messages: any[]): void {
        this._logToConsole('info', ...messages);
    }

    warn(...messages: any[]): void {
        this._logToConsole('warn', ...messages);
    }

    error(...messages: any[]): void {
        this._logToConsole('error', ...messages);
    }

    debug(...messages: any[]): void {
        this._logToConsole('debug', ...messages);
    }

    private _logToConsole(type: keyof Console, ...messages: any[]): void {
        if (!this._console || !this._console[type]) {
            return;
        }

        this._console[type].call(this._console, ...messages);
    }
}
