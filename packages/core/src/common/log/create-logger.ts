import ConsoleLogger from './console-logger';
import Logger from './logger';
import NoopLogger from './noop-logger';

export default function createLogger(isEnabled = true): Logger {
    if (!isEnabled) {
        return new NoopLogger();
    }

    return new ConsoleLogger(console);
}
