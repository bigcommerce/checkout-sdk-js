import Timeout from './timeout';

describe('Timeout', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('triggers callback when complete', (done) => {
        const timeout = new Timeout();
        const callback = jest.fn();

        timeout.onComplete(callback);
        timeout.complete();

        process.nextTick(() => {
            expect(callback).toHaveBeenCalled();
            done();
        });
    });

    it('does not trigger callback again after completion', (done) => {
        const timeout = new Timeout();
        const callback = jest.fn();

        timeout.onComplete(callback);
        timeout.complete();
        timeout.complete();

        process.nextTick(() => {
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('triggers callback after delay', (done) => {
        const timeout = new Timeout(10);
        const callback = jest.fn();

        timeout.onComplete(callback);
        timeout.start();

        jest.runTimersToTime(10);

        process.nextTick(() => {
            expect(callback).toHaveBeenCalled();
            done();
        });
    });

    it('does not trigger callback again after manual completion', (done) => {
        const timeout = new Timeout(10);
        const callback = jest.fn();

        timeout.onComplete(callback);
        timeout.complete();

        jest.runTimersToTime(10);

        process.nextTick(() => {
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
