import getFirstAndLastName from './get-first-and-last-name';

describe('getFirstAndLastName', () => {
    it('splits first and last name', () => {
        expect(getFirstAndLastName('John Doe')).toEqual(['John', 'Doe']);
    });

    it('keeps all words except the last one in the first name', () => {
        expect(getFirstAndLastName('Mary Jane Watson')).toEqual(['Mary Jane', 'Watson']);
    });

    it('returns empty last name for a single word', () => {
        expect(getFirstAndLastName('John')).toEqual(['John', '']);
    });

    it('ignores leading and trailing spaces', () => {
        expect(getFirstAndLastName('  John Doe ')).toEqual(['John', 'Doe']);
    });

    it('returns empty names if full name is empty or missing', () => {
        expect(getFirstAndLastName('')).toEqual(['', '']);
        expect(getFirstAndLastName()).toEqual(['', '']);
    });
});
