import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import PaymentMethod from './payment-method';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { getPaymentMethod, getPaymentMethods } from './payment-methods.mock';

describe('PaymentMethodRequestSender', () => {
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    });

    describe('#loadPaymentMethods()', () => {
        let response: Response<PaymentMethod[]>;

        beforeEach(() => {
            response = getResponse(getPaymentMethods());

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));
        });

        it('loads payment methods', async () => {
            expect(await paymentMethodRequestSender.loadPaymentMethods()).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments', {
                timeout: undefined,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethods(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });
    });

    describe('#loadPaymentMethod()', () => {
        let response: Response<PaymentMethod>;

        beforeEach(() => {
            response = getResponse(getPaymentMethod());

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));
        });

        it('loads payment method', async () => {
            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree')).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/braintree', {
                timeout: undefined,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });

        it('loads payment method with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree', options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/braintree', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });
    });
});
