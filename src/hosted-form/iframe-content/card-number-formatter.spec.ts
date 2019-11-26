import CardNumberFormatter from './card-number-formatter';

describe('CardNumberFormatter', () => {
    let formatter: CardNumberFormatter;

    beforeEach(() => {
        formatter = new CardNumberFormatter();
    });

    describe('#format()', () => {
        it('formats Visa credit card number', () => {
            expect(formatter.format('4111111111111111'))
                .toEqual('4111 1111 1111 1111');

            expect(formatter.format('4111 1111 1111 1111234'))
                .toEqual('4111 1111 1111 1111234');
        });

        it('formats Mastercard credit card number', () => {
            expect(formatter.format('5555555555554444'))
                .toEqual('5555 5555 5555 4444');
        });

        it('formats Amex credit card number', () => {
            expect(formatter.format('378282246310005'))
                .toEqual('3782 822463 10005');
        });

        it('formats Diners Club credit card number', () => {
            expect(formatter.format('36259600000004'))
                .toEqual('3625 960000 0004');
        });

        it('formats Discover credit card number', () => {
            expect(formatter.format('6011111111111117'))
                .toEqual('6011 1111 1111 1117');
        });

        it('formats potentially invalid credit card number', () => {
            expect(formatter.format('41111'))
                .toEqual('4111 1');

            expect(formatter.format('5555'))
                .toEqual('5555');

            expect(formatter.format('37828224631'))
                .toEqual('3782 822463 1');
        });

        it('does not format if credit card number cannot be recognized', () => {
            expect(formatter.format('99999999'))
                .toEqual('99999999');
        });
    });

    describe('#unformat()', () => {
        it('removes credit card number formatting', () => {
            expect(formatter.unformat('4111 1111 1111 1111'))
                .toEqual('4111111111111111');

            expect(formatter.unformat('3782 822463 10005'))
                .toEqual('378282246310005');
        });

        it('unformats credit card number that is partially complete', () => {
            expect(formatter.unformat('4111 1111'))
                .toEqual('41111111');
        });

        it('does not do anything if credit card number is invalid', () => {
            expect(formatter.unformat('xxxx xxxx 1111 1111'))
                .toEqual('xxxx xxxx 1111 1111');
        });
    });
});
