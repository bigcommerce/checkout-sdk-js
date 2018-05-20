import ConsoleLogger from './console-logger';
import Logger from './logger';
import NoopLogger from './noop-logger';

const logger = createLogger(process.env.NODE_ENV !== 'test');

export function createLogger(isEnabled = true): Logger {
    if (!isEnabled) {
        return new NoopLogger();
    }

    return new ConsoleLogger(console);
}

export function getDefaultLogger(): Logger {
    return logger;
}
