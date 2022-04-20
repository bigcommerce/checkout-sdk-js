import ConsoleLogger from './console-logger';
import { createLogger } from './index';
import NoopLogger from './noop-logger';

describe('createLogger()', () => {
    it('returns a console logger if logging is enabled', () => {
        const logger = createLogger();

        expect(logger instanceof ConsoleLogger).toEqual(true);
    });

    it('returns a noop logger if logging is disabled', () => {
        const logger = createLogger(false);

        expect(logger instanceof NoopLogger).toEqual(true);
    });
});
