import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { Address } from '../address';
import { BillingAddress } from '../billing';
import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getCart } from '../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getCapabilities } from '../config/capabilities.mock';
import { getConfig } from '../config/configs.mock';
import { Consignment } from '../shipping';
import { getConsignment, getConsignmentsState } from '../shipping/consignments.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import { getShippingOption } from '../shipping/shipping-options.mock';

import B2BPostOrderActionCreator from './b2b-post-order-action-creator';
import { B2BPostOrderActionType } from './b2b-post-order-actions';
import B2BPostOrderRequestSender, {
    CreateCompanyAddressPayload,
} from './b2b-post-order-request-sender';

describe('B2BPostOrderActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BPostOrderRequestSender;
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

        jest.spyOn(requestSender, 'submitCompanyAddress').mockResolvedValue(
            getResponse({ data: { addressId: '67890' }, code: 200 }),
        );

        mockStoreConfig();

        actionCreator = new B2BPostOrderActionCreator(requestSender);
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

        it('throws when the b2b token is missing', () => {
            store = createCheckoutStore(getCheckoutStoreStateWithOrder());

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            expect(() => actionCreator.persistB2BMetadata(invoiceOptions)(store)).toThrow();
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

        describe('company address flow', () => {
            const createBillingAddress = (
                overrides: Partial<BillingAddress> = {},
            ): BillingAddress => ({
                ...getBillingAddress(),
                shouldSaveAddress: false,
                ...overrides,
            });

            const createConsignment = (
                shippingOverrides: Partial<Address> = {},
                id = 'consignment-1',
            ): Consignment => ({
                ...getConsignment(),
                id,
                shippingAddress: {
                    ...getShippingAddress(),
                    shouldSaveAddress: false,
                    ...shippingOverrides,
                },
            });

            // Mirrors the shared billing/shipping address mocks (identical comparable fields, so they
            // merge unless an override makes them differ).
            const expectedCompanyAddress = (
                overrides: Partial<CreateCompanyAddressPayload> = {},
            ): CreateCompanyAddressPayload => ({
                addressLine1: '12345 Testing Way',
                addressLine2: '',
                city: 'Some City',
                label: '',
                firstName: 'Test',
                lastName: 'Tester',
                phoneNumber: '555-555-5555',
                zipCode: '95555',
                country: { countryCode: 'US', countryName: 'United States' },
                state: { stateCode: 'CA', stateName: 'California' },
                isBilling: 0,
                isCheckout: true,
                isShipping: 0,
                extraFields: [],
                ...overrides,
            });

            const mockCompanyId = (companyId: number | null) => {
                jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
                    ...getCart(),
                    companyId,
                });
            };

            const mockBillingAddress = (billingAddress: BillingAddress | undefined) => {
                jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
                    billingAddress,
                );
            };

            const mockConsignments = (consignments: Consignment[] | undefined) => {
                jest.spyOn(store.getState().consignments, 'getConsignments').mockReturnValue(
                    consignments,
                );
            };

            beforeEach(() => {
                mockCompanyId(12345);
                mockBillingAddress(createBillingAddress());
                mockConsignments([]);
            });

            it('maps the billing address from state when shouldSaveAddress is set', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(1);
                expect(requestSender.submitCompanyAddress).toHaveBeenCalledWith(
                    12345,
                    expectedCompanyAddress({ isBilling: 1, isShipping: 0 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('maps a shipping address from every consignment that opts in', async () => {
                mockConsignments([
                    createConsignment({ address1: '1 First St', shouldSaveAddress: true }, 'c-1'),
                    createConsignment({ address1: '2 Second St', shouldSaveAddress: false }, 'c-2'),
                    createConsignment({ address1: '3 Third St', shouldSaveAddress: true }, 'c-3'),
                ]);

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(2);
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    1,
                    12345,
                    expectedCompanyAddress({ addressLine1: '1 First St', isShipping: 1 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    2,
                    12345,
                    expectedCompanyAddress({ addressLine1: '3 Third St', isShipping: 1 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('deduplicates identical shipping addresses across consignments into a single save', async () => {
                mockConsignments([
                    createConsignment({ address1: '5 Same St', shouldSaveAddress: true }, 'c-1'),
                    createConsignment({ address1: '5 Same St', shouldSaveAddress: true }, 'c-2'),
                ]);

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(1);
                expect(requestSender.submitCompanyAddress).toHaveBeenCalledWith(
                    12345,
                    expectedCompanyAddress({ addressLine1: '5 Same St', isShipping: 1 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('merges billing and shipping into one entry when they are the same address', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));
                mockConsignments([createConsignment({ shouldSaveAddress: true })]);

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(1);
                expect(requestSender.submitCompanyAddress).toHaveBeenCalledWith(
                    12345,
                    expectedCompanyAddress({ isBilling: 1, isShipping: 1 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('keeps billing and shipping separate when the address matches but extra fields differ', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));
                mockConsignments([createConsignment({ shouldSaveAddress: true })]);

                await from(
                    actionCreator.persistB2BMetadata({
                        isInvoice: false,
                        extraInfo: {
                            addressExtraFields: {
                                billingAddressExtraFields: [
                                    { fieldName: 'department', fieldValue: 'Finance' },
                                ],
                                shippingAddressExtraFields: [
                                    { fieldName: 'dock', fieldValue: 'B7' },
                                ],
                            },
                        },
                    })(store),
                ).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(2);
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    1,
                    12345,
                    expectedCompanyAddress({
                        isBilling: 1,
                        isShipping: 0,
                        extraFields: [{ fieldName: 'department', fieldValue: 'Finance' }],
                    }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    2,
                    12345,
                    expectedCompanyAddress({
                        isShipping: 1,
                        extraFields: [{ fieldName: 'dock', fieldValue: 'B7' }],
                    }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('merges billing and shipping when both the address and extra fields match', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));
                mockConsignments([createConsignment({ shouldSaveAddress: true })]);

                await from(
                    actionCreator.persistB2BMetadata({
                        isInvoice: false,
                        extraInfo: {
                            addressExtraFields: {
                                billingAddressExtraFields: [
                                    { fieldName: 'department', fieldValue: 'Finance' },
                                ],
                                shippingAddressExtraFields: [
                                    { fieldName: 'department', fieldValue: 'Finance' },
                                ],
                            },
                        },
                    })(store),
                ).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(1);
                expect(requestSender.submitCompanyAddress).toHaveBeenCalledWith(
                    12345,
                    expectedCompanyAddress({
                        isBilling: 1,
                        isShipping: 1,
                        extraFields: [{ fieldName: 'department', fieldValue: 'Finance' }],
                    }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('keeps billing and shipping separate when the addresses differ', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));
                mockConsignments([
                    createConsignment({ address1: '9 Other St', shouldSaveAddress: true }),
                ]);

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(2);
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    1,
                    12345,
                    expectedCompanyAddress({ isBilling: 1, isShipping: 0 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    2,
                    12345,
                    expectedCompanyAddress({ addressLine1: '9 Other St', isShipping: 1 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('sources per-address extra fields from extraInfo.addressExtraFields', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));
                mockConsignments([
                    createConsignment({ address1: '9 Other St', shouldSaveAddress: true }),
                ]);

                await from(
                    actionCreator.persistB2BMetadata({
                        isInvoice: false,
                        extraInfo: {
                            addressExtraFields: {
                                billingAddressExtraFields: [
                                    { fieldName: 'department', fieldValue: 'Finance' },
                                ],
                                shippingAddressExtraFields: [
                                    { fieldName: 'dock', fieldValue: 'B7' },
                                ],
                            },
                        },
                    })(store),
                ).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    1,
                    12345,
                    expectedCompanyAddress({
                        isBilling: 1,
                        isShipping: 0,
                        extraFields: [{ fieldName: 'department', fieldValue: 'Finance' }],
                    }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
                expect(requestSender.submitCompanyAddress).toHaveBeenNthCalledWith(
                    2,
                    12345,
                    expectedCompanyAddress({
                        addressLine1: '9 Other St',
                        isShipping: 1,
                        extraFields: [{ fieldName: 'dock', fieldValue: 'B7' }],
                    }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('submits company addresses before submitOrderExtraFields', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                const [companyAddressCallOrder] = (requestSender.submitCompanyAddress as jest.Mock)
                    .mock.invocationCallOrder;
                const [addOrderCallOrder] = (requestSender.submitOrderExtraFields as jest.Mock).mock
                    .invocationCallOrder;

                expect(companyAddressCallOrder).toBeLessThan(addOrderCallOrder);
            });

            it('does not submit a company address when nothing opts in', async () => {
                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).not.toHaveBeenCalled();
                expect(requestSender.submitOrderExtraFields).toHaveBeenCalled();
            });

            it('does not submit a company address when the cart has no company id', async () => {
                mockCompanyId(null);
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));

                await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).not.toHaveBeenCalled();
                expect(requestSender.submitOrderExtraFields).toHaveBeenCalled();
            });

            it('submits a company address in the invoice flow', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));

                await from(actionCreator.persistB2BMetadata(invoiceOptions)(store)).toPromise();

                expect(requestSender.submitCompanyAddress).toHaveBeenCalledTimes(1);
                expect(requestSender.submitCompanyAddress).toHaveBeenCalledWith(
                    12345,
                    expectedCompanyAddress({ isBilling: 1, isShipping: 0 }),
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );
            });

            it('emits failed action without calling submitOrderExtraFields when submitCompanyAddress rejects', async () => {
                mockBillingAddress(createBillingAddress({ shouldSaveAddress: true }));

                jest.spyOn(requestSender, 'submitCompanyAddress').mockRejectedValue(
                    getErrorResponse(),
                );

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(
                    actionCreator.persistB2BMetadata(nonInvoiceOptions)(store),
                )
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(requestSender.submitOrderExtraFields).not.toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                    expect.objectContaining({
                        type: B2BPostOrderActionType.PersistB2BMetadataFailed,
                        error: true,
                    }),
                ]);
            });
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
                    'b2b-auth-token',
                    b2bApiSettings.baseUrl,
                );

                const [addOrderCallOrder] = (requestSender.submitOrderExtraFields as jest.Mock).mock
                    .invocationCallOrder;
                const [submitQuoteCallOrder] = (requestSender.submitQuote as jest.Mock).mock
                    .invocationCallOrder;

                expect(submitQuoteCallOrder).toBeGreaterThan(addOrderCallOrder);
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
                    'b2b-auth-token',
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
    });
});
