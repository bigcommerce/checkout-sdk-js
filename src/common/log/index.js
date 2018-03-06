import Logger from './logger';
import NoopLogger from './noop-logger';

/**
 * @param {boolean} isEnabled
 * @return {Logger|NoopLogger}
 */
export function createLogger(isEnabled = true) {
    if (!isEnabled) {
        return new NoopLogger();
    }

    return new Logger(console);
}
