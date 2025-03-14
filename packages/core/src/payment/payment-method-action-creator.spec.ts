import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';
import { from, merge, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import PaymentMethod from './payment-method';
import PaymentMethodActionCreator from './payment-method-action-creator';
import { PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { getPaymentMethod, getPaymentMethods, getPaymentMethodsMeta } from './payment-methods.mock';

describe('PaymentMethodActionCreator', () => {
    let errorResponse: Response<ErrorResponseBody>;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentMethodResponse: Response<PaymentMethod>;
    let paymentMethodsResponse: Response<PaymentMethod[]>;
    let store: CheckoutStore;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        paymentMethodResponse = getResponse(getPaymentMethod());
        paymentMethodsResponse = getResponse(getPaymentMethods(), {
            'x-device-session-id': getPaymentMethodsMeta().deviceSessionId,
            'x-session-hash': getPaymentMethodsMeta().sessionHash,
        });
        store = createCheckoutStore(getCheckoutStoreState());

        paymentMethodRequestSender = new PaymentMethodRequestSender(createRequestSender());
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod').mockReturnValue(
            Promise.resolve(paymentMethodResponse),
        );

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods').mockReturnValue(
            Promise.resolve(paymentMethodsResponse),
        );

        jest.spyOn(
            paymentMethodRequestSender,
            'loadPaymentWalletWithInitializationData',
        ).mockReturnValue(Promise.resolve(paymentMethodResponse));

        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(getCheckout().cart);
    });

    describe('#loadPaymentMethods()', () => {
        it('sends a request to get a list of payment methods', async () => {
            await from(paymentMethodActionCreator.loadPaymentMethods()(store)).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalled();
        });

        it('emits actions if able to load payment methods', async () => {
            const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                    payload: paymentMethodsResponse.body.filter(
                        (method) => method.id !== 'applepay',
                    ),
                    meta: {
                        deviceSessionId: paymentMethodsResponse.headers['x-device-session-id'],
                        sessionHash: paymentMethodsResponse.headers['x-session-hash'],
                    },
                },
            ]);
        });

        it('emits error actions if unable to load payment methods', async () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodsFailed,
                    payload: errorResponse,
                    error: true,
                },
            ]);
        });
    });

    describe('#loadPaymentMethod()', () => {
        it('loads payment method data', async () => {
            const methodId = 'braintree';
            const options = { params: { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' } };

            await from(paymentMethodActionCreator.loadPaymentMethod(methodId)(store)).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith(
                methodId,
                options,
            );
        });

        it('loads payment method data with timeout', async () => {
            const methodId = 'braintree';
            const options = {
                timeout: createTimeout(),
                params: { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' },
            };

            await from(
                paymentMethodActionCreator.loadPaymentMethod(methodId, options)(store),
            ).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith(
                methodId,
                options,
            );
        });

        it('emits actions if able to load payment method', async () => {
            const methodId = 'braintree';
            const actions = await from(
                paymentMethodActionCreator.loadPaymentMethod(methodId)(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    meta: { methodId },
                    payload: paymentMethodResponse.body,
                },
            ]);
        });

        it('emits actions with cached values if available', async () => {
            const methodId = 'braintree';
            const options = { useCache: true };
            const actions = await merge(
                from(paymentMethodActionCreator.loadPaymentMethod(methodId, options)(store)),
                from(paymentMethodActionCreator.loadPaymentMethod(methodId, options)(store)),
            )
                .pipe(toArray())
                .toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledTimes(1);
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    meta: { methodId },
                    payload: paymentMethodResponse.body,
                },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    meta: { methodId },
                    payload: paymentMethodResponse.body,
                },
            ]);
        });

        it('emits error actions if unable to load payment method', async () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const methodId = 'braintree';
            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(
                paymentMethodActionCreator.loadPaymentMethod(methodId)(store),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodFailed,
                    meta: { methodId },
                    payload: errorResponse,
                    error: true,
                },
            ]);
        });
    });

    describe('#loadPaymentWalletWithInitializationData()', () => {
        it('loads payment wallet method', async () => {
            const methodId = 'braintree';

            await from(
                paymentMethodActionCreator.loadPaymentWalletWithInitializationData(methodId)(store),
            ).toPromise();

            expect(
                paymentMethodRequestSender.loadPaymentWalletWithInitializationData,
            ).toHaveBeenCalledWith(methodId, undefined, undefined);
        });

        it('loads payment wallet method with timeout', async () => {
            const methodId = 'braintree';
            const options = {
                timeout: createTimeout(),
            };

            await from(
                paymentMethodActionCreator.loadPaymentWalletWithInitializationData(
                    methodId,
                    options,
                )(store),
            ).toPromise();

            expect(
                paymentMethodRequestSender.loadPaymentWalletWithInitializationData,
            ).toHaveBeenCalledWith(methodId, undefined, options);
        });

        it('emits actions if able to load payment wallet method', async () => {
            const methodId = 'braintree';
            const actions = await from(
                paymentMethodActionCreator.loadPaymentWalletWithInitializationData(methodId)(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    meta: { methodId },
                    payload: paymentMethodResponse.body,
                },
            ]);
        });

        it('emits actions with cached values if available', async () => {
            const methodId = 'braintree';
            const options = { useCache: true };
            const actions = await merge(
                from(
                    paymentMethodActionCreator.loadPaymentWalletWithInitializationData(
                        methodId,
                        options,
                    )(store),
                ),
                from(
                    paymentMethodActionCreator.loadPaymentWalletWithInitializationData(
                        methodId,
                        options,
                    )(store),
                ),
            )
                .pipe(toArray())
                .toPromise();

            expect(
                paymentMethodRequestSender.loadPaymentWalletWithInitializationData,
            ).toHaveBeenCalledTimes(1);
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    meta: { methodId },
                    payload: paymentMethodResponse.body,
                },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    meta: { methodId },
                    payload: paymentMethodResponse.body,
                },
            ]);
        });

        it('emits error actions if unable to load payment wallet method', async () => {
            jest.spyOn(
                paymentMethodRequestSender,
                'loadPaymentWalletWithInitializationData',
            ).mockReturnValue(Promise.reject(errorResponse));

            const methodId = 'braintree';
            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(
                paymentMethodActionCreator.loadPaymentWalletWithInitializationData(methodId)(store),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodFailed,
                    meta: { methodId },
                    payload: errorResponse,
                    error: true,
                },
            ]);
        });
    });

    describe('#loadPaymentMethodsByIds()', () => {
        it('loads payment methods data', async () => {
            const methodId = 'braintree';
            const options = { params: { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' } };

            await from(
                paymentMethodActionCreator.loadPaymentMethodsById([methodId])(store),
            ).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith(
                methodId,
                options,
            );
        });

        it('loads payment method data with timeout', async () => {
            const methodId = 'braintree';
            const options = {
                timeout: createTimeout(),
                params: { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' },
            };

            await from(
                paymentMethodActionCreator.loadPaymentMethodsById([methodId], options)(store),
            ).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith(
                methodId,
                options,
            );
        });

        it('emits actions if able to load payment method', async () => {
            const methodId = 'braintree';
            const actions = await from(
                paymentMethodActionCreator.loadPaymentMethodsById([methodId])(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                    payload: [getPaymentMethod()],
                },
            ]);
        });

        it('if call fails no methods are returned', async () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const methodId = 'braintree';
            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(
                paymentMethodActionCreator.loadPaymentMethodsById([methodId])(store),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                    payload: [],
                },
            ]);
        });
    });
});
