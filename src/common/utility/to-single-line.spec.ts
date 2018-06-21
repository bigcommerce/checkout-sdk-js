import toSingleLine from './to-single-line';

describe('toSingleLine()', () => {
    it('removes white spaces and line breaks', () => {
        const message = `
            Hello world.
            Foo bar.
        `;

        expect(toSingleLine(message)).toEqual('Hello world. Foo bar.');
    });
});
