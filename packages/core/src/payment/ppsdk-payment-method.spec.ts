import PaymentMethod from './payment-method';
import PaymentStrategyType from './payment-strategy-type';
import { isPPSDKPaymentMethod } from './ppsdk-payment-method';

describe('isPPSDKPaymentMethod', () => {
    it('returns false when passed a non PPSDK payment method', () => {
        const paymentMethod: PaymentMethod = {
            id: 'some-id',
            method: 'some-method',
            type: 'some-type',
            config: {},
            supportedCards: [],
            skipRedirectConfirmationAlert: false,
        };

        expect(isPPSDKPaymentMethod(paymentMethod)).toBe(false);
    });

    it('returns true when passed a PPSDK payment method', () => {
        const paymentMethod: PaymentMethod = {
            id: 'some-id',
            method: 'some-method',
            type: PaymentStrategyType.PPSDK,
            config: {},
            supportedCards: [],
            initializationStrategy: {
                type: 'some-strategy',
            },
            skipRedirectConfirmationAlert: false,
        };

        expect(isPPSDKPaymentMethod(paymentMethod)).toBe(true);
    });
});
