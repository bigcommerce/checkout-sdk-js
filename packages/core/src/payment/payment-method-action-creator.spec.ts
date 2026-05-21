import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';
import { from, merge, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import B2BCompanyPaymentMethodRequestSender, {
    B2BCompanyPaymentMethodsResponseBody,
} from './b2b-company-payment-method-request-sender';
import PaymentMethod from './payment-method';
import PaymentMethodActionCreator from './payment-method-action-creator';
import { PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { getPaymentMethod, getPaymentMethods, getPaymentMethodsMeta } from './payment-methods.mock';

describe('PaymentMethodActionCreator', () => {
    let errorResponse: Response<ErrorResponseBody>;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let b2bCompanyPaymentMethodRequestSender: B2BCompanyPaymentMethodRequestSender;
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
        b2bCompanyPaymentMethodRequestSender = new B2BCompanyPaymentMethodRequestSender(
            createRequestSender(),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            paymentMethodRequestSender,
            b2bCompanyPaymentMethodRequestSender,
        );

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod').mockReturnValue(
            Promise.resolve(paymentMethodResponse),
        );

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods').mockReturnValue(
            Promise.resolve(paymentMethodsResponse),
        );

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
                    payload: paymentMethodsResponse.body,
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

        describe('with B2B company allow-list filtering', () => {
            const companyId = 42;
            const b2bToken = 'b2b-token-value';
            const b2bBaseUrl = 'https://api-b2b.bigcommerce.com';

            const allowListResponseBody: B2BCompanyPaymentMethodsResponseBody = {
                data: [
                    {
                        code: getPaymentMethod().id,
                        name: getPaymentMethod().id,
                        isEnabled: '1',
                        paymentId: 1,
                    },
                ],
            };

            function setCapability(value: boolean): void {
                const baseConfig = store.getState().config.getStoreConfig()!;

                jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                    ...baseConfig,
                    checkoutSettings: {
                        ...baseConfig.checkoutSettings,
                        capabilities: {
                            ...baseConfig.checkoutSettings.capabilities,
                            payment: {
                                ...baseConfig.checkoutSettings.capabilities?.payment,
                                b2bPaymentMethodFilter: value,
                            },
                        },
                    } as typeof baseConfig.checkoutSettings,
                    b2bApiSettings: { baseUrl: b2bBaseUrl, clientId: 'cid' },
                });
            }

            beforeEach(() => {
                const state = store.getState();

                jest.spyOn(state.cart, 'getCart').mockReturnValue({
                    ...getCheckout().cart,
                    companyId,
                });
                jest.spyOn(state.customer, 'getCustomer').mockReturnValue({
                    ...getCheckout().customer,
                    isGuest: false,
                });
                jest.spyOn(state.b2bToken, 'getToken').mockReturnValue(b2bToken);
                setCapability(true);

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BCompanyPaymentMethods',
                ).mockResolvedValue(getResponse(allowListResponseBody));
            });

            it('applies the filter automatically when the capability is enabled', async () => {
                const actions = await from(
                    paymentMethodActionCreator.loadPaymentMethods()(store),
                )
                    .pipe(toArray())
                    .toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).toHaveBeenCalledWith(companyId, b2bToken, b2bBaseUrl, undefined);

                expect(actions).toEqual([
                    { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                    {
                        type: PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                        payload: [getPaymentMethod()],
                        meta: {
                            deviceSessionId: paymentMethodsResponse.headers['x-device-session-id'],
                            sessionHash: paymentMethodsResponse.headers['x-session-hash'],
                        },
                    },
                ]);
            });

            it('does not call the B2B request sender when the capability is disabled', async () => {
                setCapability(false);

                await from(paymentMethodActionCreator.loadPaymentMethods()(store)).toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();
            });

            it('fails with MissingDataError when the B2B token is missing from state', async () => {
                jest.spyOn(store.getState().b2bToken, 'getToken').mockReturnValue(undefined);

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();
                expect(actions[1].payload).toBeInstanceOf(MissingDataError);
            });

            it('emits LoadPaymentMethodsFailed when the B2B fetch errors', async () => {
                const b2bError = new Error('B2B endpoint unavailable');

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BCompanyPaymentMethods',
                ).mockRejectedValue(b2bError);

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                    {
                        type: PaymentMethodActionType.LoadPaymentMethodsFailed,
                        payload: b2bError,
                        error: true,
                    },
                ]);
            });

            it('fails with MissingDataError when companyId is missing', async () => {
                jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
                    ...getCheckout().cart,
                    companyId: null,
                });

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();
                expect(actions[1].payload).toBeInstanceOf(MissingDataError);
            });

            it('fails with MissingDataError when the customer is a guest', async () => {
                jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue({
                    ...getCheckout().customer,
                    isGuest: true,
                });

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();
                expect(actions[1].payload).toBeInstanceOf(MissingDataError);
            });

            it('fails with MissingDataError when the B2B base URL is unavailable', async () => {
                const baseConfig = store.getState().config.getStoreConfig()!;

                jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                    ...baseConfig,
                    b2bApiSettings: { baseUrl: '', clientId: '' },
                });

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();
                expect(actions[1].payload).toBeInstanceOf(MissingDataError);
            });
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
