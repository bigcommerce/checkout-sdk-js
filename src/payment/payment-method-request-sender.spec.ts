import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import PaymentMethodRequestSender from './payment-method-request-sender';
import { PaymentMethodsResponseBody, PaymentMethodResponseBody } from './payment-method-responses';
import { getPaymentMethodsResponseBody, getPaymentMethodResponseBody } from './payment-methods.mock';

describe('PaymentMethodRequestSender', () => {
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    });

    describe('#loadPaymentMethods()', () => {
        let response: Response<PaymentMethodsResponseBody>;

        beforeEach(() => {
            response = getResponse(getPaymentMethodsResponseBody());

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));
        });

        it('loads payment methods', async () => {
            expect(await paymentMethodRequestSender.loadPaymentMethods()).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments', { timeout: undefined });
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethods(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments', options);
        });
    });

    describe('#getPaymentMethod()', () => {
        let response: Response<PaymentMethodResponseBody>;

        beforeEach(() => {
            response = getResponse(getPaymentMethodResponseBody());

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));
        });

        it('loads payment method', async () => {
            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree')).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments/braintree', { timeout: undefined });
        });

        it('loads payment method with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree', options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments/braintree', options);
        });
    });
});
