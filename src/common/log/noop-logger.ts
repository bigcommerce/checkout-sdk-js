import Logger from './logger';

export default class NoopLogger implements Logger {
    log(): void {}

    info(): void {}

    warn(): void {}

    error(): void {}

    debug(): void {}
}
