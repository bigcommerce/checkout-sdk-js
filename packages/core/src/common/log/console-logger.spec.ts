import ConsoleLogger from './console-logger';

// tslint:disable:no-console
describe('ConsoleLogger', () => {
    let logger: ConsoleLogger;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'info').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'debug').mockImplementation();

        logger = new ConsoleLogger(console);
    });

    describe('#log()', () => {
        it('logs messages to console', () => {
            logger.log('hello', 'world');

            expect(console.log).toHaveBeenCalled();
        });

        it('does not throw an error if console is unavailable', () => {
            logger = new ConsoleLogger(undefined);

            expect(() => logger.log('hello', 'world')).not.toThrow();
        });
    });

    describe('#info()', () => {
        it('logs info messages to console', () => {
            logger.info('hello', 'world');

            expect(console.info).toHaveBeenCalled();
        });
    });

    describe('#warn()', () => {
        it('logs warning messages to console', () => {
            logger.warn('hello', 'world');

            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('#error()', () => {
        it('logs error messages to console', () => {
            logger.error('hello', 'world');

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('#debug()', () => {
        it('logs debug messages to console', () => {
            logger.debug('hello', 'world');

            expect(console.debug).toHaveBeenCalled();
        });
    });
});
