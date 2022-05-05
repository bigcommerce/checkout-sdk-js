import CardExpiryFormatter from './card-expiry-formatter';

describe('CardExpiryFormatter', () => {
    let formatter: CardExpiryFormatter;

    beforeEach(() => {
        formatter = new CardExpiryFormatter();
    });

    describe('#format', () => {
        it('converts date into MM/YY date format', () => {
            expect(formatter.format('10/2019'))
                .toEqual('10 / 19');
        });

        it('formats partial date value', () => {
            expect(formatter.format('10'))
                .toEqual('10 / ');
        });

        it('returns month only if there is no year and separator has no trailing space', () => {
            expect(formatter.format('10 /'))
                .toEqual('10');
        });

        it('surrounds separator with whitespaces', () => {
            expect(formatter.format('10/19'))
                .toEqual('10 / 19');
        });
    });

    describe('#toObject', () => {
        it('converts MM / YY date format into expiry date object', () => {
            expect(formatter.toObject('01 / 30'))
                .toEqual({ month: '01', year: '2030' });

            expect(formatter.toObject('12 / 30'))
                .toEqual({ month: '12', year: '2030' });
        });

        it('converts MM / YYYY date format into expiry date object', () => {
            expect(formatter.toObject('01 / 2030'))
                .toEqual({ month: '01', year: '2030' });

            expect(formatter.toObject('12 / 2030'))
                .toEqual({ month: '12', year: '2030' });
        });

        it('converts M / YY date format into expiry date object', () => {
            expect(formatter.toObject('1 / 30'))
                .toEqual({ month: '01', year: '2030' });
        });

        it('returns empty expiry date object if date format is invalid', () => {
            expect(formatter.toObject('fo / ba'))
                .toEqual({ month: '', year: '' });
        });
    });
});
