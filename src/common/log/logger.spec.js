import Logger from './logger';

describe('Logger', () => {
    let logger;
    let mockConsole;

    beforeEach(() => {
        mockConsole = {
            log: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };

        logger = new Logger(mockConsole);
    });

    describe('#log()', () => {
        it('logs messages to console', () => {
            logger.log('hello', 'world');

            expect(mockConsole.log).toHaveBeenCalled();
        });

        it('does not throw an error if console is unavailable', () => {
            logger = new Logger(undefined);

            expect(() => logger.log('hello', 'world')).not.toThrow();
        });
    });

    describe('#info()', () => {
        it('logs info messages to console', () => {
            logger.info('hello', 'world');

            expect(mockConsole.info).toHaveBeenCalled();
        });
    });

    describe('#warn()', () => {
        it('logs warning messages to console', () => {
            logger.warn('hello', 'world');

            expect(mockConsole.warn).toHaveBeenCalled();
        });
    });

    describe('#error()', () => {
        it('logs error messages to console', () => {
            logger.error('hello', 'world');

            expect(mockConsole.error).toHaveBeenCalled();
        });
    });

    describe('#debug()', () => {
        it('logs debug messages to console', () => {
            logger.debug('hello', 'world');

            expect(mockConsole.debug).toHaveBeenCalled();
        });
    });
});
