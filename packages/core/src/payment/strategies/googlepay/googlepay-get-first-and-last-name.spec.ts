import { getFirstAndLastName } from './googlepay-get-first-and-last-name';

describe('With a one part name', () => {
    it('assigns the whole string as the first name', () => {
        expect(getFirstAndLastName('Cher')).toEqual(['Cher', '']);
    });
});

describe('With a two part name', () => {
    it('splits the string into a first and a second name', () => {
        expect(getFirstAndLastName('Lee Dunkley')).toEqual(['Lee', 'Dunkley']);
    });
});

describe('With a three or more part name', () => {
    it('assigns the final part as the last name and all others as the first name', () => {
        expect(getFirstAndLastName('Neil deGrasse Tyson')).toEqual(['Neil deGrasse', 'Tyson']);
        expect(getFirstAndLastName('Ignacio Arsenio Travieso Scull')).toEqual([
            'Ignacio Arsenio Travieso',
            'Scull',
        ]);
    });
});
