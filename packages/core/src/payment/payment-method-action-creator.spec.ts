import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';
import { from, merge, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { CartSource, ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
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
    });

    describe('B2B payment method filtering', () => {
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
                const nextConfig = {
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
                };

                jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(nextConfig);
                jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
                    nextConfig,
                );
            }

            beforeEach(() => {
                const state = store.getState();
                const b2bCart = {
                    ...getCheckout().cart,
                    companyId,
                };

                jest.spyOn(state.cart, 'getCart').mockReturnValue(b2bCart);
                jest.spyOn(state.cart, 'getCartOrThrow').mockReturnValue(b2bCart);
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
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
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

            it('forwards options to the B2B request sender', async () => {
                const options = { timeout: createTimeout() };

                await from(
                    paymentMethodActionCreator.loadPaymentMethods(options)(store),
                ).toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).toHaveBeenCalledWith(companyId, b2bToken, b2bBaseUrl, options);
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
        });

        describe('with B2B invoice allow-list filtering', () => {
            const companyId = 42;
            const b2bToken = 'b2b-token-value';
            const b2bBaseUrl = 'https://api-b2b.bigcommerce.com';
            const allowedMethodsResponseBody = {
                data: { allowedMethods: [getPaymentMethod().id] },
            };

            beforeEach(() => {
                const state = store.getState();
                const invoiceCart = {
                    ...getCheckout().cart,
                    companyId,
                    source: CartSource.INVOICE,
                };
                const baseConfig = state.config.getStoreConfig()!;
                const invoiceConfig = {
                    ...baseConfig,
                    checkoutSettings: {
                        ...baseConfig.checkoutSettings,
                        capabilities: {
                            ...baseConfig.checkoutSettings.capabilities,
                            payment: {
                                ...baseConfig.checkoutSettings.capabilities?.payment,
                                b2bPaymentMethodFilter: false,
                            },
                        },
                    } as typeof baseConfig.checkoutSettings,
                    b2bApiSettings: { baseUrl: b2bBaseUrl, clientId: 'cid' },
                };

                jest.spyOn(state.cart, 'getCart').mockReturnValue(invoiceCart);
                jest.spyOn(state.cart, 'getCartOrThrow').mockReturnValue(invoiceCart);
                jest.spyOn(state.customer, 'getCustomer').mockReturnValue({
                    ...getCheckout().customer,
                    isGuest: false,
                });
                jest.spyOn(state.customer, 'getCustomerOrThrow').mockReturnValue({
                    ...getCheckout().customer,
                    isGuest: false,
                });
                jest.spyOn(state.b2bToken, 'getToken').mockReturnValue(b2bToken);
                jest.spyOn(state.config, 'getStoreConfig').mockReturnValue(invoiceConfig);
                jest.spyOn(state.config, 'getStoreConfigOrThrow').mockReturnValue(invoiceConfig);

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BInvoiceAllowedPaymentMethods',
                ).mockResolvedValue(getResponse(allowedMethodsResponseBody));
                jest.spyOn(b2bCompanyPaymentMethodRequestSender, 'getB2BCompanyPaymentMethods');
            });

            it('applies the invoice filter when cart.source is INVOICE even if the capability is disabled', async () => {
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(toArray())
                    .toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods,
                ).toHaveBeenCalledWith(b2bBaseUrl, b2bToken, undefined);
                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();

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

            it('forwards options to the B2B invoice request sender', async () => {
                const options = { timeout: createTimeout() };

                await from(
                    paymentMethodActionCreator.loadPaymentMethods(options)(store),
                ).toPromise();

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods,
                ).toHaveBeenCalledWith(b2bBaseUrl, b2bToken, options);
            });

            it('emits LoadPaymentMethodsFailed when the invoice fetch errors', async () => {
                const invoiceError = new Error('Invoice endpoint unavailable');

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BInvoiceAllowedPaymentMethods',
                ).mockRejectedValue(invoiceError);

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(paymentMethodActionCreator.loadPaymentMethods()(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                    {
                        type: PaymentMethodActionType.LoadPaymentMethodsFailed,
                        payload: invoiceError,
                        error: true,
                    },
                ]);
            });
        });

        describe('#_shouldFilterForB2b()', () => {
            function mockState({
                source,
                capability,
            }: {
                source: CartSource | undefined;
                capability: boolean;
            }): void {
                const state = store.getState();
                const baseConfig = state.config.getStoreConfig()!;

                jest.spyOn(state.cart, 'getCartOrThrow').mockReturnValue({
                    ...getCheckout().cart,
                    source,
                });
                jest.spyOn(state.config, 'getStoreConfigOrThrow').mockReturnValue({
                    ...baseConfig,
                    checkoutSettings: {
                        ...baseConfig.checkoutSettings,
                        capabilities: {
                            ...baseConfig.checkoutSettings.capabilities,
                            payment: {
                                ...baseConfig.checkoutSettings.capabilities?.payment,
                                b2bPaymentMethodFilter: capability,
                            },
                        },
                    } as typeof baseConfig.checkoutSettings,
                });
            }

            it('returns true when cart.source is CartSource.INVOICE', () => {
                mockState({ source: CartSource.INVOICE, capability: false });

                expect(
                    (paymentMethodActionCreator as any)._shouldFilterForB2b(store.getState()),
                ).toBe(true);
            });

            it('returns true when the b2bPaymentMethodFilter capability is enabled', () => {
                mockState({ source: undefined, capability: true });

                expect(
                    (paymentMethodActionCreator as any)._shouldFilterForB2b(store.getState()),
                ).toBe(true);
            });

            it('returns false when neither the invoice source nor the capability applies', () => {
                mockState({ source: undefined, capability: false });

                expect(
                    (paymentMethodActionCreator as any)._shouldFilterForB2b(store.getState()),
                ).toBe(false);
            });
        });

        describe('#_applyB2bFilter()', () => {
            const companyId = 42;
            const b2bToken = 'b2b-token-value';
            const b2bBaseUrl = 'https://api-b2b.bigcommerce.com';

            beforeEach(() => {
                const state = store.getState();
                const cart = {
                    ...getCheckout().cart,
                    companyId,
                };

                jest.spyOn(state.cart, 'getCart').mockReturnValue(cart);
                jest.spyOn(state.cart, 'getCartOrThrow').mockReturnValue(cart);
                jest.spyOn(state.customer, 'getCustomer').mockReturnValue({
                    ...getCheckout().customer,
                    isGuest: false,
                });
                jest.spyOn(state.b2bToken, 'getToken').mockReturnValue(b2bToken);
                jest.spyOn(state.config, 'getStoreConfig').mockReturnValue({
                    ...state.config.getStoreConfig()!,
                    b2bApiSettings: { baseUrl: b2bBaseUrl, clientId: 'cid' },
                });

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BCompanyPaymentMethods',
                ).mockResolvedValue(
                    getResponse({
                        data: [
                            {
                                code: getPaymentMethod().id,
                                name: getPaymentMethod().id,
                                isEnabled: '1',
                                paymentId: 1,
                            },
                        ],
                    }),
                );
                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BInvoiceAllowedPaymentMethods',
                ).mockResolvedValue(
                    getResponse({ data: { allowedMethods: [getPaymentMethod().id] } }),
                );
            });

            it('throws MissingDataError when the customer is missing', async () => {
                jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
                jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockImplementation(
                    () => {
                        throw new MissingDataError(MissingDataErrorType.MissingCustomer);
                    },
                );

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bFilter(
                        [getPaymentMethod()],
                        store.getState(),
                    ),
                ).rejects.toThrow(MissingDataError);
            });

            it('throws MissingDataError when the customer is a guest', async () => {
                const guestCustomer = {
                    ...getCheckout().customer,
                    isGuest: true,
                };

                jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(guestCustomer);
                jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                    guestCustomer,
                );

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bFilter(
                        [getPaymentMethod()],
                        store.getState(),
                    ),
                ).rejects.toThrow(MissingDataError);
            });

            it('throws MissingDataError when the B2B token is missing', async () => {
                jest.spyOn(store.getState().b2bToken, 'getToken').mockReturnValue(undefined);

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bFilter(
                        [getPaymentMethod()],
                        store.getState(),
                    ),
                ).rejects.toThrow(MissingDataError);
            });

            it('throws MissingDataError when companyId is missing', async () => {
                const noCompanyCart = {
                    ...getCheckout().cart,
                    companyId: null,
                };

                jest.spyOn(store.getState().cart, 'getCart').mockReturnValue(noCompanyCart);
                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(noCompanyCart);

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bFilter(
                        [getPaymentMethod()],
                        store.getState(),
                    ),
                ).rejects.toThrow(MissingDataError);
            });

            it('throws MissingDataError when the resolved B2B base URL is empty', async () => {
                const baseConfig = store.getState().config.getStoreConfig()!;

                jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                    ...baseConfig,
                    b2bApiSettings: { baseUrl: '', clientId: '' },
                });

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bFilter(
                        [getPaymentMethod()],
                        store.getState(),
                    ),
                ).rejects.toThrow(MissingDataError);
            });

            it('delegates to the invoice filter when cart.source is CartSource.INVOICE', async () => {
                const invoiceCart = {
                    ...getCheckout().cart,
                    companyId,
                    source: CartSource.INVOICE,
                };

                jest.spyOn(store.getState().cart, 'getCart').mockReturnValue(invoiceCart);
                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(invoiceCart);

                await (paymentMethodActionCreator as any)._applyB2bFilter(
                    [getPaymentMethod()],
                    store.getState(),
                );

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods,
                ).toHaveBeenCalledWith(b2bBaseUrl, b2bToken, undefined);
                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).not.toHaveBeenCalled();
            });

            it('delegates to the company filter when cart.source is not CartSource.INVOICE', async () => {
                await (paymentMethodActionCreator as any)._applyB2bFilter(
                    [getPaymentMethod()],
                    store.getState(),
                );

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).toHaveBeenCalledWith(companyId, b2bToken, b2bBaseUrl, undefined);
                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods,
                ).not.toHaveBeenCalled();
            });
        });

        describe('#_applyB2bCompanyFilter()', () => {
            const companyId = 42;
            const b2bToken = 'b2b-token-value';
            const baseUrl = 'https://api-b2b.bigcommerce.com';

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

            beforeEach(() => {
                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BCompanyPaymentMethods',
                ).mockResolvedValue(getResponse(allowListResponseBody));
            });

            it('fetches the allowlist and returns the filtered subset', async () => {
                const methods = [getPaymentMethod()];

                const result = await (paymentMethodActionCreator as any)._applyB2bCompanyFilter(
                    methods,
                    companyId,
                    b2bToken,
                    baseUrl,
                );

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods,
                ).toHaveBeenCalledWith(companyId, b2bToken, baseUrl, undefined);
                expect(result).toEqual([getPaymentMethod()]);
            });

            it('propagates errors from the B2B request sender', async () => {
                const b2bError = new Error('B2B endpoint unavailable');

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BCompanyPaymentMethods',
                ).mockRejectedValue(b2bError);

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bCompanyFilter(
                        [getPaymentMethod()],
                        companyId,
                        b2bToken,
                        baseUrl,
                    ),
                ).rejects.toBe(b2bError);
            });
        });

        describe('#_applyB2bInvoiceFilter()', () => {
            const baseUrl = 'https://api-b2b.bigcommerce.com';
            const b2bToken = 'b2b-token-value';

            beforeEach(() => {
                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BInvoiceAllowedPaymentMethods',
                ).mockResolvedValue(
                    getResponse({ data: { allowedMethods: [getPaymentMethod().id] } }),
                );
            });

            it('fetches allowedMethods and returns the filtered subset', async () => {
                const methods = [getPaymentMethod()];

                const result = await (paymentMethodActionCreator as any)._applyB2bInvoiceFilter(
                    methods,
                    baseUrl,
                    b2bToken,
                );

                expect(
                    b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods,
                ).toHaveBeenCalledWith(baseUrl, b2bToken, undefined);
                expect(result).toEqual([getPaymentMethod()]);
            });

            it('returns an empty array when no input method id is in allowedMethods', async () => {
                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BInvoiceAllowedPaymentMethods',
                ).mockResolvedValue(
                    getResponse({ data: { allowedMethods: ['some-other-method'] } }),
                );

                const result = await (paymentMethodActionCreator as any)._applyB2bInvoiceFilter(
                    [getPaymentMethod()],
                    baseUrl,
                    b2bToken,
                );

                expect(result).toEqual([]);
            });

            it('propagates errors from the B2B invoice request sender', async () => {
                const invoiceError = new Error('Invoice endpoint unavailable');

                jest.spyOn(
                    b2bCompanyPaymentMethodRequestSender,
                    'getB2BInvoiceAllowedPaymentMethods',
                ).mockRejectedValue(invoiceError);

                await expect(
                    (paymentMethodActionCreator as any)._applyB2bInvoiceFilter(
                        [getPaymentMethod()],
                        baseUrl,
                        b2bToken,
                    ),
                ).rejects.toBe(invoiceError);
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
