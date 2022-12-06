import ConsoleLogger from './console-logger';
import NoopLogger from './noop-logger';

import { createLogger } from './index';

describe('createLogger()', () => {
    it('returns a console logger if logging is enabled', () => {
        const logger = createLogger();

        expect(logger instanceof ConsoleLogger).toBe(true);
    });

    it('returns a noop logger if logging is disabled', () => {
        const logger = createLogger(false);

        expect(logger instanceof NoopLogger).toBe(true);
    });
});
