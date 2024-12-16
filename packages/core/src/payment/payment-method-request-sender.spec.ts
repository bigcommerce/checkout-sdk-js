import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../common/http-request';
import { getHeadlessPaymentResponse, getResponse } from '../common/http-request/responses.mock';

import { HeadlessPaymentMethodResponse } from './headless-payment-method-response';
import { getHeadlessPaymentMethod, initializationData } from './headless-payment-methods.mock';
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

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads payment methods', async () => {
            expect(await paymentMethodRequestSender.loadPaymentMethods()).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments', {
                timeout: undefined,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethods(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads payment methods with params', async () => {
            const options = { params: { method: 'method-id' } };

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethods(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });
    });

    describe('#loadPaymentMethod()', () => {
        let response: Response<PaymentMethod>;

        beforeEach(() => {
            response = getResponse(getPaymentMethod());

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads payment method', async () => {
            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('braintree')).toEqual(
                response,
            );
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/braintree', {
                timeout: undefined,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads payment method with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(
                await paymentMethodRequestSender.loadPaymentMethod('braintree', options),
            ).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/braintree', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads payment method with params', async () => {
            const options = { params: { method: 'method-id' } };

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(await paymentMethodRequestSender.loadPaymentMethod('afterpay', options)).toEqual(
                response,
            );
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/afterpay', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });
    });

    describe('#loadPaymentWalletWithInitializationData()', () => {
        let response: Response<HeadlessPaymentMethodResponse>;
        const authorization = 'authorization-1234';

        beforeEach(() => {
            response = getHeadlessPaymentResponse(getHeadlessPaymentMethod());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('loads headless payment method', async () => {
            const walletInitData =
                await paymentMethodRequestSender.loadPaymentWalletWithInitializationData(
                    'paypalcommerce',
                    { headers: { Authorization: authorization } },
                );

            expect(requestSender.post).toHaveBeenCalledWith(
                '/graphql',
                expect.objectContaining({
                    headers: {
                        Authorization: authorization,
                        'Content-Type': 'application/json',
                    },
                }),
            );

            expect(walletInitData).toEqual(
                expect.objectContaining({
                    body: {
                        initializationData,
                        clientToken: 'clientToken',
                        id: 'paypalcommerce',
                        config: {},
                        method: '',
                        supportedCards: [],
                        type: 'PAYMENT_TYPE_API',
                    },
                }),
            );
        });
    });
});
