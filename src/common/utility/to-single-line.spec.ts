import toSingleLine from './to-single-line';

describe('toSingleLine()', () => {
    it('removes white spaces and line breaks', () => {
        const message = `
            Hello world.
            Foo bar.
        `;

        expect(toSingleLine(message)).toEqual('Hello world. Foo bar.');
    });

    it('returns empty string when no arguments are supplied', () => {
        expect(toSingleLine()).toEqual('');
    });
});
