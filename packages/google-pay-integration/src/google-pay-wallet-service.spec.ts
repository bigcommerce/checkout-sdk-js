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
import { GooglePayCardNetwork, TotalPriceStatusType } from './types';

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
            );

            expect(scriptLoader.getGooglePaymentsClient).toHaveBeenCalledWith(true);
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
            await service.initialize(getBraintree(), transactionInfo);

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
                }),
            );
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
