import { isBoltPaymentData } from './bolt-payment-data';

describe('isBoltPaymentData', () => {
    it('payment data is matches nonce instrument', () => {
        const paymentData = {
            nonce: 'nonce',
        };

        expect(isBoltPaymentData(paymentData)).toBe(true);
    });

    it('payment data is matches account creation', () => {
        const paymentData = {
            shouldCreateAccount: false,
        };

        expect(isBoltPaymentData(paymentData)).toBe(true);
    });

    it('payment data is not matches BoltPaymentData', () => {
        const paymentData = {
            anyOther: 'some data',
        };

        expect(isBoltPaymentData(paymentData)).toBe(false);
    });

    it('payment data is not object', () => {
        const paymentData = null;

        expect(isBoltPaymentData(paymentData)).toBe(false);
    });
});
