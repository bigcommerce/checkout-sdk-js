import { PaypalCommerceFundingKeyResolver } from './index';

describe('paypalCommerceFundingKeyResolver', () => {
    const paypalCommerceFundingKeyResolver = new PaypalCommerceFundingKeyResolver();

    it('should return "PAYPAL"', () => {
        expect(paypalCommerceFundingKeyResolver.resolve('paypalcommerce')).toBe('PAYPAL');
    });

    it('should return "PAYLATER"', () => {
        expect(paypalCommerceFundingKeyResolver.resolve('paypalcommercecredit')).toBe('PAYLATER');
    });

    describe('check alternative payment method', () => {
        it('should return "BANCONTACT"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'bancontact',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('BANCONTACT');
        });

        it('should return "GIROPAY"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'giropay',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('GIROPAY');
        });

        it('should return "P24"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve('p24', 'paypalcommercealternativemethods'),
            ).toBe('P24');
        });

        it('should return "EPS"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve('eps', 'paypalcommercealternativemethods'),
            ).toBe('EPS');
        });

        it('should return "IDEAL"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'ideal',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('IDEAL');
        });

        it('should return "MYBANK"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'mybank',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('MYBANK');
        });

        it('should return "SOFORT"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'sofort',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('SOFORT');
        });

        it('should return "BLIK"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'blik',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('BLIK');
        });

        it('should return "TRUSTLY"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'trustly',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('TRUSTLY');
        });

        it('should return "SEPA"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'sepa',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('SEPA');
        });

        it('should return "VENMO"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'venmo',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('VENMO');
        });

        it('should return "OXXO"', () => {
            expect(
                paypalCommerceFundingKeyResolver.resolve(
                    'oxxo',
                    'paypalcommercealternativemethods',
                ),
            ).toBe('OXXO');
        });
    });
});
