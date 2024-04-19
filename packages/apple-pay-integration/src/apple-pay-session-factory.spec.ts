import ApplePaySessionFactory, { assertApplePayWindow } from './apple-pay-session-factory';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';

describe('apple pay session factory', () => {
    it('throws an error if apple pay window object is not present', () => {
        try {
            assertApplePayWindow(window);
        } catch (err) {
            expect((err as Error).message).toBe('Apple pay is not supported');
        }
    });

    it('calling create method returns an apple pay session', () => {
        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: MockApplePaySession,
        });

        const factory = new ApplePaySessionFactory();

        const request = {} as ApplePayJS.ApplePayPaymentRequest;
        const session = factory.create(request);

        expect(session).toBeInstanceOf(ApplePaySession);
    });
});
