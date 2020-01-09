import { MissingDataError } from '../../../common/error/errors';

import { PaypalCommercePaymentProcessor } from './index';

// tslint:disable:no-non-null-assertion
describe('PaypalCommercePaymentProcessor', () => {
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    const focus = jest.fn();
    const close = jest.fn();

    beforeEach(() => {
        window.open = jest.fn();

        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor();
    });

    it('call window.open', async () => {
        try {
            await paypalCommercePaymentProcessor.paymentPayPal('approveUrl');
        } catch (error) {
            expect(window.open).toHaveBeenCalled();
        }
    });

    it('throw error when window closed', async () => {
        await expect(paypalCommercePaymentProcessor.paymentPayPal('approveUrl')).rejects.toThrow(MissingDataError);
    });

    it('check event listener on message', async () => {
        window.open = jest.fn(() => ({ focus, close }));
        const map: {[key: string]: any}  = {};

        window.addEventListener = jest.fn((event, cb) => {
            if (event === 'message') {
                setTimeout(() => {
                    cb({
                        origin: 'https://www.paypal.com',
                        data: JSON.stringify({ operation: 'return_to_merchant', updateParent: true }),
                    });
                });
            }

            map[event] = cb;
        });

        const res = await paypalCommercePaymentProcessor.paymentPayPal('approveUrl');

        expect(res).toEqual(true);
    });
});
// tslint:enable:no-non-null-assertion
