import setPrototypeOf from './set-prototype-of';

describe('setPrototypeOf', () => {
    it('assigns prototype to object', () => {
        class CustomError extends Error {}

        const error = new CustomError();

        setPrototypeOf(error, CustomError.prototype);

        expect(error instanceof CustomError).toBeTruthy();
    });
});
