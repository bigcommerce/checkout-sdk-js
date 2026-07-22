import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { B2BTokenRequestSender } from '../b2b-token';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getCapabilities } from '../config/capabilities.mock';
import { getConfig } from '../config/configs.mock';
import { getGuestCustomer } from '../customer/customers.mock';
import { getConsignmentsState } from '../shipping/consignments.mock';
import { getShippingOption } from '../shipping/shipping-options.mock';

import B2BPostOrderActionCreator from './b2b-post-order-action-creator';
import { B2BPostOrderActionType } from './b2b-post-order-actions';
import B2BPostOrderRequestSender from './b2b-post-order-request-sender';

describe('B2BPostOrderActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BPostOrderRequestSender;
    let b2bTokenRequestSender: B2BTokenRequestSender;
    let actionCreator: B2BPostOrderActionCreator;

    const comment = 'Invoice comment';
    const invoiceOptions = { isInvoice: true, invoiceComment: comment };
    const nonInvoiceOptions = { isInvoice: false, invoiceComment: '' };
    const b2bApiSettings = {
        clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx',
        baseUrl: 'https://api-b2b.bigcommerce.com',
    };

    const mockStoreConfig = (quoteConfig?: { id: number } | null) => {
        const storeConfig = getConfig().storeConfig;

        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
            ...storeConfig,
            b2bApiSettings,
            checkoutSettings: {
                ...storeConfig.checkoutSettings,
                ...(quoteConfig === undefined
                    ? {}
                    : { capabilities: getCapabilities({ userJourney: { quoteConfig } }) }),
            },
        });
    };

    beforeEach(() => {
        store = createCheckoutStore({
            ...getCheckoutStoreStateWithOrder(),
            b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
        });

        requestSender = new B2BPostOrderRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'submitInvoice').mockResolvedValue(
            getResponse({ data: { paymentId: 'pay_1', receiptId: 'rcpt_1' }, code: 200 }),
        );

        jest.spyOn(requestSender, 'submitOrderExtraFields').mockResolvedValue(
            getResponse(undefined),
        );

        jest.spyOn(requestSender, 'submitQuote').mockResolvedValue(getResponse(undefined));

        b2bTokenRequestSender = new B2BTokenRequestSender(createRequestSender());

        jest.spyOn(b2bTokenRequestSender, 'getCurrentCustomerJWT').mockResolvedValue(
            'bc-jwt-token',
        );

        mockStoreConfig();

        actionCreator = new B2BPostOrderActionCreator(requestSender, b2bTokenRequestSender);
    });

    describe('#persistB2BMetadata()', () => {
        it('emits requested and succeeded actions on success', async () => {
            const actions = await from(actionCreator.persistB2BMetadata(invoiceOptions)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                {
                    type: B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                    payload: { receiptId: 'rcpt_1' },
                },
            ]);
        });

        it('calls closeInvoice with the order id, comment, token and base url', async () => {
            await from(actionCreator.persistB2BMetadata(invoiceOptions)(store)).toPromise();

            expect(requestSender.submitInvoice).toHaveBeenCalledWith(
                { orderId: '295', comment },
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
            );
        });

        it('calls submitOrderExtraFields and dispatches succeeded with empty receiptId when isInvoice is false', async () => {
            const actions = await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store))
                .pipe(toArray())
                .toPromise();

            expect(requestSender.submitInvoice).not.toHaveBeenCalled();
            expect(requestSender.submitOrderExtraFields).toHaveBeenCalledWith(
                {
                    orderId: 295,
                    poNumber: '',
                    referenceNumber: '',
                    extraFields: [],
                    extraInfo: {},
                },
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
            );
            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                {
                    type: B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                    payload: { receiptId: '' },
                },
            ]);
        });

        it('forwards po number, reference number, extra fields and extra info to submitOrderExtraFields', async () => {
            const extraFields = [{ fieldName: 'department', fieldValue: 'engineering' }];
            const extraInfo = { billingAddressId: 12 };

            await from(
                actionCreator.persistB2BMetadata({
                    isInvoice: false,
                    poNumber: 'PO-123',
                    referenceNumber: 'REF-456',
                    extraFields,
                    extraInfo,
                })(store),
            ).toPromise();

            expect(requestSender.submitOrderExtraFields).toHaveBeenCalledWith(
                {
                    orderId: 295,
                    poNumber: 'PO-123',
                    referenceNumber: 'REF-456',
                    extraFields,
                    extraInfo,
                },
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
            );
        });

        it('does not call submitOrderExtraFields when isInvoice is true', async () => {
            await from(actionCreator.persistB2BMetadata(invoiceOptions)(store)).toPromise();

            expect(requestSender.submitOrderExtraFields).not.toHaveBeenCalled();
        });

        it('throws when the order id is missing', () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
            });

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            expect(() => actionCreator.persistB2BMetadata(invoiceOptions)(store)).toThrow();
        });

        it('emits failed action when the b2b token is missing in the invoice flow', async () => {
            store = createCheckoutStore(getCheckoutStoreStateWithOrder());

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.persistB2BMetadata(invoiceOptions)(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(requestSender.submitInvoice).not.toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                expect.objectContaining({
                    type: B2BPostOrderActionType.PersistB2BMetadataFailed,
                    error: true,
                }),
            ]);
        });

        it('throws when the b2b base url is missing', () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings: { ...b2bApiSettings, baseUrl: '' },
            });

            expect(() => actionCreator.persistB2BMetadata(invoiceOptions)(store)).toThrow();
        });

        it('emits failed action when the request rejects', async () => {
            jest.spyOn(requestSender, 'submitInvoice').mockRejectedValue(getErrorResponse());

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.persistB2BMetadata(invoiceOptions)(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                expect.objectContaining({
                    type: B2BPostOrderActionType.PersistB2BMetadataFailed,
                    error: true,
                }),
            ]);
        });

        describe('quote-to-checkout flow', () => {
            it('calls submitQuote after submitOrderExtraFields with the payload mapped from checkout state', async () => {
                mockStoreConfig({ id: 941 });

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitQuote).toHaveBeenCalledWith(
                    941,
                    {
                        orderId: 295,
                        storeHash: 'k1drp8k8',
                        shippingTotal: 15,
                        taxTotal: 3,
                        shippingMethod: getShippingOption(),
                        shippingAddress: {
                            country: 'United States',
                            state: 'California',
                            city: 'Some City',
                            zipCode: '95555',
                            address: '12345 Testing Way',
                            apartment: '',
                            firstName: 'Test',
                            lastName: 'Tester',
                        },
                    },
                    { b2bToken: 'b2b-auth-token', bcToken: undefined },
                    b2bApiSettings.baseUrl,
                );

                const [addOrderCallOrder] = (requestSender.submitOrderExtraFields as jest.Mock).mock
                    .invocationCallOrder;
                const [submitQuoteCallOrder] = (requestSender.submitQuote as jest.Mock).mock
                    .invocationCallOrder;

                expect(submitQuoteCallOrder).toBeGreaterThan(addOrderCallOrder);
            });

            it('submits the quote with a bc token when a signed-in customer has no b2b token', async () => {
                store = createCheckoutStore(getCheckoutStoreStateWithOrder());
                mockStoreConfig({ id: 941 });

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitOrderExtraFields).not.toHaveBeenCalled();
                expect(b2bTokenRequestSender.getCurrentCustomerJWT).toHaveBeenCalledWith(
                    b2bApiSettings.clientId,
                );
                expect(requestSender.submitQuote).toHaveBeenCalledWith(
                    941,
                    expect.objectContaining({ orderId: 295 }),
                    { b2bToken: undefined, bcToken: 'bc-jwt-token' },
                    b2bApiSettings.baseUrl,
                );
            });

            it('does not call submitQuote when quoteConfig is null', async () => {
                mockStoreConfig(null);

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitQuote).not.toHaveBeenCalled();
            });

            it('does not call submitQuote when capabilities are undefined', async () => {
                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitQuote).not.toHaveBeenCalled();
            });

            it('sends null shipping fields when the checkout has no consignments', async () => {
                store = createCheckoutStore({
                    ...getCheckoutStoreStateWithOrder(),
                    b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
                    consignments: { ...getConsignmentsState(), data: [] },
                });
                mockStoreConfig({ id: 941 });

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitQuote).toHaveBeenCalledWith(
                    941,
                    expect.objectContaining({
                        shippingTotal: null,
                        shippingMethod: null,
                        shippingAddress: null,
                    }),
                    { b2bToken: 'b2b-auth-token', bcToken: undefined },
                    b2bApiSettings.baseUrl,
                );
            });

            it('emits failed action without calling submitQuote when the checkout state is missing', async () => {
                store = createCheckoutStore({
                    ...getCheckoutStoreStateWithOrder(),
                    b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
                    checkout: { errors: {}, statuses: {} },
                });
                mockStoreConfig({ id: 941 });

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(
                    actionCreator.persistB2BMetadata(nonInvoiceOptions)(store),
                )
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(requestSender.submitOrderExtraFields).toHaveBeenCalled();
                expect(requestSender.submitQuote).not.toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                    expect.objectContaining({
                        type: B2BPostOrderActionType.PersistB2BMetadataFailed,
                        error: true,
                    }),
                ]);
            });

            it('emits failed action when submitQuote rejects', async () => {
                mockStoreConfig({ id: 941 });

                jest.spyOn(requestSender, 'submitQuote').mockRejectedValue(getErrorResponse());

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(
                    actionCreator.persistB2BMetadata(nonInvoiceOptions)(store),
                )
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(requestSender.submitOrderExtraFields).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                    expect.objectContaining({
                        type: B2BPostOrderActionType.PersistB2BMetadataFailed,
                        error: true,
                    }),
                ]);
            });

            it('does not call submitQuote in the invoice flow even when a quote id is present', async () => {
                mockStoreConfig({ id: 941 });

                await from(actionCreator.persistB2BMetadata(invoiceOptions)(store)).toPromise();

                expect(requestSender.submitQuote).not.toHaveBeenCalled();
            });
        });

        describe('guest quote-to-checkout flow', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    ...getCheckoutStoreStateWithOrder(),
                    customer: { data: getGuestCustomer(), errors: {}, statuses: {} },
                });

                mockStoreConfig({ id: 941 });
            });

            it('submits the quote without a token and skips submitOrderExtraFields', async () => {
                const actions = await from(
                    actionCreator.persistB2BMetadata(nonInvoiceOptions)(store),
                )
                    .pipe(toArray())
                    .toPromise();

                expect(requestSender.submitOrderExtraFields).not.toHaveBeenCalled();
                expect(b2bTokenRequestSender.getCurrentCustomerJWT).not.toHaveBeenCalled();
                expect(requestSender.submitQuote).toHaveBeenCalledWith(
                    941,
                    expect.objectContaining({ orderId: 295 }),
                    { b2bToken: undefined, bcToken: undefined },
                    b2bApiSettings.baseUrl,
                );
                expect(actions).toEqual([
                    { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                    {
                        type: B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                        payload: { receiptId: '' },
                    },
                ]);
            });
        });
    });
});
