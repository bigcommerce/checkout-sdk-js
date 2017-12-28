import { createTimeout } from '@bigcommerce/request-sender';
import { getPaymentMethodsResponseBody, getPaymentMethodResponseBody } from './payment-methods.mock';
import { getResponse } from '../common/http-request/responses.mock';
import PaymentMethodRequestSender from './payment-method-request-sender';

describe('PaymentMethodRequestSender', () => {
    let paymentMethodRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            get: jest.fn(() => Promise.resolve()),
        };

        paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    });

    describe('#loadPaymentMethods()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getPaymentMethodsResponseBody());

            requestSender.get.mockReturnValue(Promise.resolve(response));
        });

        it('loads payment methods', async () => {
            expect(await paymentMethodRequestSender.loadPaymentMethods()).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments', { timeout: undefined });
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };

            requestSender.get.mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethods(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments', options);
        });
    });

    describe('#getPaymentMethod()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getPaymentMethodResponseBody());

            requestSender.get.mockReturnValue(Promise.resolve(response));
        });

        it('loads payment method', async () => {
            requestSender.get.mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree')).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments/braintree', { timeout: undefined });
        });

        it('loads payment method with timeout', async () => {
            const options = { timeout: createTimeout() };

            requestSender.get.mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree', options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments/braintree', options);
        });
    });
});
