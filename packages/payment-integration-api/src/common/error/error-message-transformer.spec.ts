import ErrorMessageTransformer from './error-message-transformer';

describe('ErrorMessageTransformer', () => {
    it('transforms error message according to customizer', () => {
        const customizer = jest.fn(error => {
            return `${error.message} Good bye.`;
        });

        const transformer = new ErrorMessageTransformer(customizer);
        const error = new Error('Hello world.');

        expect(transformer.transform(error).message)
            .toEqual('Hello world. Good bye.');
    });

    it('trims white spaces and removes line breaks', () => {
        const customizer = jest.fn(error => {
            return `
                ${error.message}
                Good
                bye.
            `;
        });

        const transformer = new ErrorMessageTransformer(customizer);
        const error = new Error(`Hello world.`);

        expect(transformer.transform(error).message)
            .toEqual('Hello world. Good bye.');
    });
});
