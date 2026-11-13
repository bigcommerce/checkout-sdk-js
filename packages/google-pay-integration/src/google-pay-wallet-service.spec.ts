import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    NotInitializedError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    CheckoutHandoffMethod,
    CreateRedirectToCheckoutHandoffResponseBody,
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import GooglePayWalletService from './google-pay-wallet-service';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getBraintree } from './mocks/google-pay-payment-method.mock';
import getGooglePaymentsClientMocks from './mocks/google-pay-payments-client.mock';
import {
    CallbackTriggerType,
    GooglePayCardNetwork,
    IntermediatePaymentData,
    TotalPriceStatusType,
} from './types';

describe('GooglePayWalletService', () => {
    let gateway: GooglePayWalletGateway;
    let formPoster: FormPoster;
    let scriptLoader: GooglePayScriptLoader;
    let service: GooglePayWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;
    let clientMocks: ReturnType<typeof getGooglePaymentsClientMocks>;
    let container: HTMLDivElement;

    const containerId = 'google-pay-wallet-container';
    const gatewayParameters = { gateway: 'braintree' };
    const transactionInfo = {
        currencyCode: 'USD',
        totalPrice: '10.00',
        totalPriceStatus: TotalPriceStatusType.ESTIMATED,
    };
    const redirectData = {
        paymentWalletData: { providerId: 'googlepaybraintree', providerOrderId: 'nonce' },
        queryParams: [{ key: 'nonce', value: 'nonce' }],
    };
    const shippingUpdateResult = {
        consignmentEntityId: 'consignment-1',
        availableShippingOptions: [
            {
                entityId: 'rate-1',
                description: 'Flat rate',
                isRecommended: true,
                transitTime: '2 days',
                cost: { value: '2.50', formattedV2: '$2.50' },
            },
        ],
        currencyCode: 'USD',
        totalPrice: '12.50',
    };
    const selectedShippingUpdateResult = {
        ...shippingUpdateResult,
        selectedShippingOptionEntityId: 'rate-1',
    };

    beforeEach(() => {
        clientMocks = getGooglePaymentsClientMocks();

        gateway = {
            initialize: jest.fn().mockResolvedValue(undefined),
            getPaymentGatewayParameters: jest.fn().mockReturnValue(gatewayParameters),
            getRedirectData: jest.fn().mockResolvedValue(redirectData),
            deinitialize: jest.fn().mockResolvedValue(undefined),
        };

        scriptLoader = new GooglePayScriptLoader(getScriptLoader());
        jest.spyOn(scriptLoader, 'getGooglePaymentsClient').mockResolvedValue(
            clientMocks.paymentsClient,
        );

        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
        jest.spyOn(walletButtonIntegrationService, 'updateShippingAddress').mockResolvedValue(
            shippingUpdateResult,
        );
        jest.spyOn(walletButtonIntegrationService, 'selectShippingOption').mockResolvedValue(
            selectedShippingUpdateResult,
        );
        jest.spyOn(walletButtonIntegrationService, 'addBillingAddress').mockResolvedValue({
            body: {} as never,
            status: 200,
            statusText: 'OK',
            headers: {},
        });
        jest.spyOn(
            walletButtonIntegrationService,
            'getRedirectToCheckoutHandoff',
        ).mockResolvedValue({
            body: {
                redirectUrls: {
                    externalCheckoutUrl: 'https://store.example.com/checkout',
                    externalCheckoutHandoff: {
                        url: 'https://store.example.com/checkout',
                        method: CheckoutHandoffMethod.Redirect,
                        fields: [],
                    },
                },
            },
            status: 200,
            statusText: 'OK',
            headers: {},
        });

        Object.defineProperty(window, 'location', {
            value: { assign: jest.fn() },
            writable: true,
        });

        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);

        formPoster = createFormPoster();
        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());

        service = new GooglePayWalletService(
            walletButtonIntegrationService,
            scriptLoader,
            gateway,
            formPoster,
        );
    });

    afterEach(() => {
        container.remove();
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('loads google payments client in test mode and initializes gateway', async () => {
            const paymentMethod = getBraintree();

            await service.initialize(
                { ...paymentMethod, config: { ...paymentMethod.config, testMode: true } },
                transactionInfo,
                undefined,
                {
                    cartId: 'cart-123',
                    lineItems: [{ entityId: 'line-item-1', quantity: 1, isShippingRequired: true }],
                    currencyDecimalPlaces: 2,
                },
            );

            expect(scriptLoader.getGooglePaymentsClient).toHaveBeenCalledWith(
                true,
                expect.objectContaining({
                    paymentDataCallbacks: {
                        onPaymentDataChanged: expect.any(Function),
                    },
                }),
            );
            expect(gateway.initialize).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'googlepaybraintree' }),
                'USD',
            );
            expect(gateway.getPaymentGatewayParameters).toHaveBeenCalledWith(
                {
                    merchantName: 'Example Merchant',
                    merchantId: '12345678901234567890',
                    authJwt: 'foo.bar.baz',
                },
                transactionInfo,
            );
        });

        it('throws an error if initialization data is missing', async () => {
            await expect(
                service.initialize(
                    { ...getBraintree(), initializationData: undefined },
                    transactionInfo,
                ),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });
    });

    describe('#isReadyToPay()', () => {
        it('returns google pay readiness', async () => {
            await service.initialize(getBraintree(), transactionInfo);

            await expect(service.isReadyToPay()).resolves.toBe(true);
            expect(clientMocks.paymentsClient.isReadyToPay).toHaveBeenCalledWith({
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [
                    expect.objectContaining({
                        type: 'CARD',
                        parameters: expect.objectContaining({
                            allowedCardNetworks: [
                                GooglePayCardNetwork.AMEX,
                                GooglePayCardNetwork.DISCOVER,
                                GooglePayCardNetwork.JCB,
                                GooglePayCardNetwork.VISA,
                                GooglePayCardNetwork.MC,
                            ],
                        }),
                    }),
                ],
            });
        });

        it('returns false if readiness check fails', async () => {
            await service.initialize(getBraintree(), transactionInfo);

            clientMocks.paymentsClient.isReadyToPay.mockRejectedValue(new Error());

            await expect(service.isReadyToPay()).resolves.toBe(false);
        });
    });

    describe('#renderButton()', () => {
        it('renders google pay button in container', async () => {
            await service.initialize(getBraintree(), transactionInfo);

            const onClick = jest.fn();

            service.renderButton(containerId, { buttonColor: 'black', onClick });

            expect(clientMocks.paymentsClient.createButton).toHaveBeenCalledWith(
                expect.objectContaining({ buttonColor: 'black', onClick }),
            );
            expect(container.contains(clientMocks.button)).toBe(true);
        });

        it('throws an error if container is not found', async () => {
            await service.initialize(getBraintree(), transactionInfo);

            expect(() => service.renderButton('unknown', { onClick: jest.fn() })).toThrow(
                InvalidArgumentError,
            );
        });

        it('throws an error if service is not initialized', () => {
            expect(() => service.renderButton(containerId, { onClick: jest.fn() })).toThrow(
                NotInitializedError,
            );
        });
    });

    describe('#showPaymentSheet()', () => {
        it('loads payment data with gateway tokenization parameters', async () => {
            await service.initialize(getBraintree(), transactionInfo, ['US', 'CA'], {
                cartId: 'cart-123',
                lineItems: [{ entityId: 'line-item-1', quantity: 1, isShippingRequired: true }],
                currencyDecimalPlaces: 2,
            });

            const response = await service.showPaymentSheet();

            expect(response).toEqual(clientMocks.cardDataResponse);
            expect(clientMocks.paymentsClient.loadPaymentData).toHaveBeenCalledWith(
                expect.objectContaining({
                    allowedPaymentMethods: [
                        expect.objectContaining({
                            tokenizationSpecification: {
                                type: 'PAYMENT_GATEWAY',
                                parameters: gatewayParameters,
                            },
                        }),
                    ],
                    transactionInfo,
                    emailRequired: true,
                    shippingAddressRequired: true,
                    shippingOptionRequired: true,
                    callbackIntents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'],
                    shippingAddressParameters: {
                        allowedCountryCodes: ['US', 'CA'],
                        phoneNumberRequired: true,
                    },
                }),
            );
        });

        it('updates shipping data and returns shipping options through payment data callbacks', async () => {
            const lineItems = [{ entityId: 'line-item-1', quantity: 1, isShippingRequired: true }];

            jest.mocked(walletButtonIntegrationService.updateShippingAddress).mockResolvedValue({
                ...shippingUpdateResult,
                totalPrice: '12.5',
            });
            jest.mocked(walletButtonIntegrationService.selectShippingOption).mockResolvedValue({
                ...selectedShippingUpdateResult,
                selectedShippingOptionEntityId: undefined,
                totalPrice: '12.5',
            });

            await service.initialize(getBraintree(), transactionInfo, ['US'], {
                cartId: 'cart-123',
                lineItems,
                currencyDecimalPlaces: 2,
            });

            const clientOptions = jest.mocked(scriptLoader.getGooglePaymentsClient).mock
                .calls[0]?.[1];
            const onPaymentDataChanged = clientOptions?.paymentDataCallbacks?.onPaymentDataChanged;

            if (!onPaymentDataChanged) {
                throw new Error('Expected the payment data callback to be registered.');
            }

            const response = getCardDataResponse();
            const addressResult = await onPaymentDataChanged({
                callbackTrigger: CallbackTriggerType.SHIPPING_ADDRESS,
                shippingAddress: response.shippingAddress!,
                shippingOptionData: { id: 'rate-1' },
                offerData: { redemptionCodes: [] },
            });

            expect(walletButtonIntegrationService.updateShippingAddress).toHaveBeenCalledWith(
                'cart-123',
                expect.objectContaining({ address1: '11305 4 Points Dr' }),
                { lineItems, consignmentEntityId: undefined },
            );
            expect(walletButtonIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                'cart-123',
                'consignment-1',
                'rate-1',
            );
            expect(walletButtonIntegrationService.selectShippingOption).toHaveBeenCalledTimes(1);
            expect(addressResult).toEqual({
                newTransactionInfo: {
                    currencyCode: 'USD',
                    totalPrice: '12.50',
                    totalPriceStatus: TotalPriceStatusType.FINAL,
                },
                newShippingOptionParameters: {
                    defaultSelectedOptionId: 'rate-1',
                    shippingOptions: [
                        {
                            id: 'rate-1',
                            label: '$2.50 Flat rate',
                            description: '2 days',
                        },
                    ],
                },
            });

            const optionResult = await onPaymentDataChanged({
                callbackTrigger: CallbackTriggerType.SHIPPING_OPTION,
                shippingAddress: response.shippingAddress!,
                shippingOptionData: { id: 'rate-1' },
                offerData: { redemptionCodes: [] },
            });

            expect(optionResult).toEqual({
                newTransactionInfo: {
                    currencyCode: 'USD',
                    totalPrice: '12.50',
                    totalPriceStatus: TotalPriceStatusType.FINAL,
                },
            });
        });

        it('reuses the created consignment after initialization returns no rates', async () => {
            const lineItems = [{ entityId: 'line-item-1', quantity: 1, isShippingRequired: true }];
            const initialConsignmentId = 'consignment-initial';

            jest.mocked(walletButtonIntegrationService.updateShippingAddress)
                .mockResolvedValueOnce({
                    ...shippingUpdateResult,
                    totalPrice: '12.5',
                    consignmentEntityId: initialConsignmentId,
                    availableShippingOptions: [],
                })
                .mockResolvedValueOnce({
                    ...shippingUpdateResult,
                    consignmentEntityId: initialConsignmentId,
                });

            await service.initialize(getBraintree(), transactionInfo, ['US'], {
                cartId: 'cart-123',
                lineItems,
                currencyDecimalPlaces: 2,
            });

            const clientOptions = jest.mocked(scriptLoader.getGooglePaymentsClient).mock
                .calls[0]?.[1];
            const onPaymentDataChanged = clientOptions?.paymentDataCallbacks?.onPaymentDataChanged;

            if (!onPaymentDataChanged) {
                throw new Error('Expected the payment data callback to be registered.');
            }

            const response = getCardDataResponse();
            const initializeResult = await onPaymentDataChanged({
                callbackTrigger: CallbackTriggerType.INITIALIZE,
                shippingAddress: response.shippingAddress!,
                shippingOptionData: { id: '' },
                offerData: { redemptionCodes: [] },
            });

            expect(initializeResult).toEqual({
                newTransactionInfo: {
                    currencyCode: 'USD',
                    totalPrice: '12.50',
                    totalPriceStatus: TotalPriceStatusType.ESTIMATED,
                },
            });

            const addressResult = await onPaymentDataChanged({
                callbackTrigger: CallbackTriggerType.SHIPPING_ADDRESS,
                shippingAddress: response.shippingAddress!,
                shippingOptionData: { id: 'rate-1' },
                offerData: { redemptionCodes: [] },
            });

            expect(walletButtonIntegrationService.updateShippingAddress).toHaveBeenNthCalledWith(
                2,
                'cart-123',
                expect.objectContaining({ address1: '11305 4 Points Dr' }),
                { lineItems, consignmentEntityId: initialConsignmentId },
            );
            expect(addressResult).toEqual(
                expect.objectContaining({
                    newShippingOptionParameters: expect.objectContaining({
                        defaultSelectedOptionId: 'rate-1',
                    }),
                }),
            );
        });

        it('does not reuse a shipping consignment after reinitializing for another cart', async () => {
            const firstLineItems = [
                { entityId: 'line-item-1', quantity: 1, isShippingRequired: true },
            ];
            const nextLineItems = [
                { entityId: 'line-item-2', quantity: 1, isShippingRequired: true },
            ];
            const response = getCardDataResponse();
            const getShippingCallback = (callIndex: number) => {
                const clientOptions = jest.mocked(scriptLoader.getGooglePaymentsClient).mock.calls[
                    callIndex
                ]?.[1];
                const callback = clientOptions?.paymentDataCallbacks?.onPaymentDataChanged;

                if (!callback) {
                    throw new Error('Expected the payment data callback to be registered.');
                }

                return callback;
            };

            await service.initialize(getBraintree(), transactionInfo, undefined, {
                cartId: 'first-cart',
                lineItems: firstLineItems,
                currencyDecimalPlaces: 2,
            });
            await getShippingCallback(0)({
                callbackTrigger: CallbackTriggerType.INITIALIZE,
                shippingAddress: response.shippingAddress!,
                shippingOptionData: { id: '' },
                offerData: { redemptionCodes: [] },
            });

            await service.initialize(getBraintree(), transactionInfo, undefined, {
                cartId: 'next-cart',
                lineItems: nextLineItems,
                currencyDecimalPlaces: 2,
            });
            await getShippingCallback(1)({
                callbackTrigger: CallbackTriggerType.SHIPPING_ADDRESS,
                shippingAddress: response.shippingAddress!,
                shippingOptionData: { id: 'rate-1' },
                offerData: { redemptionCodes: [] },
            });

            expect(walletButtonIntegrationService.updateShippingAddress).toHaveBeenNthCalledWith(
                2,
                'next-cart',
                expect.objectContaining({ address1: '11305 4 Points Dr' }),
                { lineItems: nextLineItems, consignmentEntityId: undefined },
            );
        });

        it('omits shipping configuration when no line item requires shipping', async () => {
            await service.initialize(getBraintree(), transactionInfo, ['US', 'CA'], {
                cartId: 'cart-123',
                lineItems: [{ entityId: 'digital-item-1', quantity: 1, isShippingRequired: false }],
                currencyDecimalPlaces: 2,
            });

            await service.showPaymentSheet();

            const request = clientMocks.paymentsClient.loadPaymentData.mock.calls[0]?.[0];

            expect(request).toBeDefined();
            expect(request).not.toHaveProperty('shippingAddressRequired');
            expect(request).not.toHaveProperty('shippingOptionRequired');
            expect(request).not.toHaveProperty('callbackIntents');
            expect(request).not.toHaveProperty('shippingAddressParameters');
        });

        it('waits for a shipping address before updating on initialize', async () => {
            await service.initialize(getBraintree(), transactionInfo, undefined, {
                cartId: 'cart-123',
                lineItems: [{ entityId: 'line-item-1', quantity: 1, isShippingRequired: true }],
                currencyDecimalPlaces: 2,
            });

            const clientOptions = jest.mocked(scriptLoader.getGooglePaymentsClient).mock
                .calls[0]?.[1];
            const onPaymentDataChanged = clientOptions?.paymentDataCallbacks?.onPaymentDataChanged;

            if (!onPaymentDataChanged) {
                throw new Error('Expected the payment data callback to be registered.');
            }

            await expect(
                onPaymentDataChanged({
                    callbackTrigger: CallbackTriggerType.INITIALIZE,
                    shippingAddress: undefined,
                    shippingOptionData: { id: '' },
                    offerData: { redemptionCodes: [] },
                } as unknown as IntermediatePaymentData),
            ).resolves.toBeUndefined();
            expect(walletButtonIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
        });
    });

    describe('#addBillingAddress()', () => {
        it('adds billing address mapped from google pay response', async () => {
            await service.addBillingAddress('cart-123', getCardDataResponse());

            expect(walletButtonIntegrationService.addBillingAddress).toHaveBeenCalledWith(
                'cart-123',
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    company: '',
                    address1: '505 Oakland Ave',
                    address2: 'Building 1, 1st Floor',
                    city: 'Austin',
                    email: 'john.doe@example.com',
                    stateOrProvince: 'TX',
                    stateOrProvinceCode: 'TX',
                    countryCode: 'US',
                    postalCode: '78703',
                    phone: '+1 555-555-5555',
                    shouldSaveAddress: false,
                },
            );
        });

        it('throws an error if billing address is missing', async () => {
            const response = getCardDataResponse();

            delete response.paymentMethodData.info.billingAddress;

            await expect(service.addBillingAddress('cart-123', response)).rejects.toBeInstanceOf(
                InvalidArgumentError,
            );
        });
    });

    describe('#updateShippingAddress()', () => {
        it('updates shipping address with the supplied line items', async () => {
            const address = service.mapToShippingAddress(getCardDataResponse());
            const lineItems = [{ entityId: 'line-item-1', quantity: 2 }];
            const updateShippingAddress = jest
                .spyOn(walletButtonIntegrationService, 'updateShippingAddress')
                .mockResolvedValue(undefined);

            await service.updateShippingAddress('cart-123', address!, lineItems);

            expect(updateShippingAddress).toHaveBeenCalledWith('cart-123', address, { lineItems });
        });
    });

    describe('#mapToShippingAddress()', () => {
        it('maps the Google Pay shipping address', () => {
            expect(service.mapToShippingAddress(getCardDataResponse())).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: '11305 4 Points Dr',
                address2: 'Building 2, Suite 100',
                city: 'Austin',
                email: 'john.doe@example.com',
                stateOrProvince: 'TX',
                stateOrProvinceCode: 'TX',
                countryCode: 'US',
                postalCode: '78726',
                phone: '+1 555-555-5555',
                shouldSaveAddress: false,
            });
        });

        it('returns undefined if the Google Pay response has no shipping address', () => {
            const response = getCardDataResponse();

            delete response.shippingAddress;

            expect(service.mapToShippingAddress(response)).toBeUndefined();
        });
    });

    describe('#redirectToCheckout()', () => {
        const mockRedirectUrls = (
            redirectUrls: CreateRedirectToCheckoutHandoffResponseBody['redirectUrls'],
        ) =>
            jest
                .spyOn(walletButtonIntegrationService, 'getRedirectToCheckoutHandoff')
                .mockResolvedValue({
                    body: { redirectUrls },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                });

        it('requests checkout redirect with gateway redirect data', async () => {
            const response = getCardDataResponse();

            mockRedirectUrls({
                externalCheckoutUrl: 'https://store.example.com/checkout',
                externalCheckoutHandoff: {
                    url: 'https://store.example.com/checkout',
                    method: CheckoutHandoffMethod.Redirect,
                    fields: [],
                },
            });

            await service.redirectToCheckout('cart-123', response);

            expect(gateway.getRedirectData).toHaveBeenCalledWith(response, 'cart-123');
            expect(
                walletButtonIntegrationService.getRedirectToCheckoutHandoff,
            ).toHaveBeenCalledWith({
                paymentWalletData: redirectData.paymentWalletData,
                cartEntityId: 'cart-123',
                queryParams: [
                    { key: 'action', value: 'set_external_checkout' },
                    { key: 'nonce', value: 'nonce' },
                ],
            });
        });

        it('posts handoff fields to checkout if handoff method is POST', async () => {
            mockRedirectUrls({
                externalCheckoutUrl: 'https://store.example.com/checkout',
                externalCheckoutHandoff: {
                    url: 'https://store.example.com/checkout.php',
                    method: CheckoutHandoffMethod.Post,
                    fields: [
                        { name: 'action', value: 'set_external_checkout' },
                        { name: 'nonce', value: 'nonce' },
                    ],
                },
            });

            await service.redirectToCheckout('cart-123', getCardDataResponse());

            expect(formPoster.postForm).toHaveBeenCalledWith(
                'https://store.example.com/checkout.php',
                { action: 'set_external_checkout', nonce: 'nonce' },
            );
            expect(window.location.assign).not.toHaveBeenCalled();
        });

        it('redirects to handoff url if handoff method is REDIRECT', async () => {
            mockRedirectUrls({
                externalCheckoutUrl: 'https://store.example.com/checkout',
                externalCheckoutHandoff: {
                    url: 'https://store.example.com/checkout?handoff=1',
                    method: CheckoutHandoffMethod.Redirect,
                    fields: [],
                },
            });

            await service.redirectToCheckout('cart-123', getCardDataResponse());

            expect(window.location.assign).toHaveBeenCalledWith(
                'https://store.example.com/checkout?handoff=1',
            );
            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('throws an error if handoff method is unknown', async () => {
            mockRedirectUrls({
                externalCheckoutUrl: 'https://store.example.com/checkout',
                externalCheckoutHandoff: {
                    url: 'https://store.example.com/checkout.php',
                    method: 'PUT' as CheckoutHandoffMethod,
                    fields: [{ name: 'nonce', value: 'nonce' }],
                },
            });

            await expect(
                service.redirectToCheckout('cart-123', getCardDataResponse()),
            ).rejects.toBeInstanceOf(PaymentMethodFailedError);
            expect(window.location.assign).not.toHaveBeenCalled();
            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('does not fall back to external checkout url if handoff is missing', async () => {
            mockRedirectUrls({
                externalCheckoutUrl: 'https://store.example.com/checkout',
                externalCheckoutHandoff: null,
            });

            await expect(
                service.redirectToCheckout('cart-123', getCardDataResponse()),
            ).rejects.toThrow(
                new PaymentMethodFailedError(
                    'Failed to redirect to checkout page: checkout handoff is missing in the redirect response',
                ),
            );
            expect(window.location.assign).not.toHaveBeenCalled();
        });

        it('throws an error if redirect urls are missing', async () => {
            mockRedirectUrls(null);

            await expect(
                service.redirectToCheckout('cart-123', getCardDataResponse()),
            ).rejects.toThrow(new PaymentMethodFailedError('Failed to redirect to checkout page'));
        });
    });

    describe('#deinitialize()', () => {
        it('removes button and deinitializes gateway', async () => {
            await service.initialize(getBraintree(), transactionInfo);
            service.renderButton(containerId, { onClick: jest.fn() });

            await service.deinitialize();

            expect(container.contains(clientMocks.button)).toBe(false);
            expect(gateway.deinitialize).toHaveBeenCalled();
        });
    });
});
