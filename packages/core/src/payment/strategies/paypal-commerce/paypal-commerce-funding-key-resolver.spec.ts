import { PaypalCommerceFundingKeyResolver } from './index';

describe('paypalCommerceFundingKeyResolver', () => {
    const paypalCommerceFundingKeyResolver = new PaypalCommerceFundingKeyResolver();

    it('should return "PAYPAL"', () => {
        expect(paypalCommerceFundingKeyResolver.resolve('paypalcommerce')).toEqual('PAYPAL');
    });

    it('should return "PAYLATER"', () => {
        expect(paypalCommerceFundingKeyResolver.resolve('paypalcommercecredit')).toEqual('PAYLATER');
    });

    describe('check alternative payment method', () => {
        it('should return "BANCONTACT"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('bancontact', 'paypalcommercealternativemethods')).toEqual('BANCONTACT');
        });

        it('should return "GIROPAY"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('giropay', 'paypalcommercealternativemethods')).toEqual('GIROPAY');
        });

        it('should return "P24"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('p24', 'paypalcommercealternativemethods')).toEqual('P24');
        });

        it('should return "EPS"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('eps', 'paypalcommercealternativemethods')).toEqual('EPS');
        });

        it('should return "IDEAL"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('ideal', 'paypalcommercealternativemethods')).toEqual('IDEAL');
        });

        it('should return "MYBANK"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('mybank', 'paypalcommercealternativemethods')).toEqual('MYBANK');
        });

        it('should return "SOFORT"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('sofort', 'paypalcommercealternativemethods')).toEqual('SOFORT');
        });

        it('should return "BLIK"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('blik', 'paypalcommercealternativemethods')).toEqual('BLIK');
        });

        it('should return "TRUSTLY"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('trustly', 'paypalcommercealternativemethods')).toEqual('TRUSTLY');
        });

        it('should return "SEPA"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('sepa', 'paypalcommercealternativemethods')).toEqual('SEPA');
        });

        it('should return "VENMO"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('venmo', 'paypalcommercealternativemethods')).toEqual('VENMO');
        });

        it('should return "OXXO"', () => {
            expect(paypalCommerceFundingKeyResolver.resolve('oxxo', 'paypalcommercealternativemethods')).toEqual('OXXO');
        });
    });
});
