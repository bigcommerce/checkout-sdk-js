import getEnvironment from './get-environment';

describe('getEnvironment', () => {
    let savedEnvironment: string;
    let savedProcess: any;

    beforeEach(() => {
        savedEnvironment = process.env;
        savedProcess = global.process;
        process.env = {};
    });

    afterEach(() => {
        global.process = savedProcess;
        process.env = savedEnvironment;
    });

    it('returns the value set in process.env.NODE_ENV', () => {
        global.process.env.NODE_ENV = 'test';

        expect(getEnvironment()).toBe('test');
    });

    it('defaults to development if no value is set', () => {
        global.process.env.NODE_ENV = undefined;

        expect(getEnvironment()).toBe('development');
    });

    it('defaults to development if process is not defined', () => {
        delete global.process;

        expect(getEnvironment()).toBe('development');
    });
});
