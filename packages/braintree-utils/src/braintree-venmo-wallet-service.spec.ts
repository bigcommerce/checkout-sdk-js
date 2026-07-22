import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletError from './braintree-paypal-wallet-error';
import BraintreeVenmoWalletService from './braintree-venmo-wallet-service';

import {
    BraintreeDataCollector,
    BraintreeError,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
    getDataCollectorMock,
    getTokenizePayload,
    getVenmoCheckoutMock,
} from './';

describe('BraintreeVenmoWalletService', () => {
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let braintreeVenmoCheckoutMock: BraintreeVenmoCheckout;
    let dataCollector: BraintreeDataCollector;
    let paymentIntegrationService: PaymentIntegrationService;
    let service: BraintreeVenmoWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const containerId = 'braintree-venmo-wallet-mock-id';
    const methodId = 'braintreevenmo';
    const cartId = 'cart-123';
    const clientToken = 'clientToken';
    const externalCheckoutUrl = 'https://store.example/checkout.php?action=set_external_checkout';

    beforeEach(() => {
        dataCollector = getDataCollectorMock();
        braintreeVenmoCheckoutMock = getVenmoCheckoutMock();
        braintreeVenmoCheckoutMock.tokenize = jest.fn(
            (
                callback: (
                    error: BraintreeError | undefined,
                    payload: BraintreeTokenizePayload,
                ) => void,
            ) => {
                callback(undefined, getTokenizePayload());
            },
        );

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');

        service = new BraintreeVenmoWalletService(
            walletButtonIntegrationService,
            braintreeIntegrationService,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize').mockImplementation(jest.fn());
        jest.spyOn(braintreeIntegrationService, 'teardown').mockResolvedValue();
        jest.spyOn(braintreeIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(braintreeIntegrationService, 'getVenmoCheckout').mockResolvedValue(
            braintreeVenmoCheckoutMock,
        );
        jest.spyOn(braintreeIntegrationService, 'getDataCollector').mockResolvedValue(
            dataCollector,
        );

        jest.spyOn(walletButtonIntegrationService, 'getRedirectToCheckoutUrl').mockResolvedValue({
            body: { redirectUrls: { externalCheckoutUrl } },
        } as Awaited<ReturnType<WalletButtonIntegrationService['getRedirectToCheckoutUrl']>>);

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { assign: jest.fn() },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('initializes braintree integration service with the client token', () => {
            service.initialize(clientToken);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(clientToken);
        });
    });

    describe('#loadVenmoCheckout()', () => {
        it('resolves with the braintree venmo checkout instance', async () => {
            const checkout = await service.loadVenmoCheckout(containerId);

            expect(checkout).toBe(braintreeVenmoCheckoutMock);
        });

        it('removes the container and rethrows when checkout creation fails', async () => {
            const error = new UnsupportedBrowserError();

            jest.spyOn(braintreeIntegrationService, 'getVenmoCheckout').mockRejectedValue(error);

            await expect(service.loadVenmoCheckout(containerId)).rejects.toBe(error);

            expect(braintreeIntegrationService.removeElement).toHaveBeenCalledWith(containerId);
        });
    });

    describe('#getBraintreeVenmoCheckoutOrThrow()', () => {
        it('throws when the venmo checkout has not been loaded', () => {
            expect(() => service.getBraintreeVenmoCheckoutOrThrow()).toThrow(
                PaymentMethodClientUnavailableError,
            );
        });

        it('returns the venmo checkout once loaded', async () => {
            await service.loadVenmoCheckout(containerId);

            expect(service.getBraintreeVenmoCheckoutOrThrow()).toBe(braintreeVenmoCheckoutMock);
        });
    });

    describe('#teardown()', () => {
        it('tears down the braintree integration service', async () => {
            await service.teardown();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#proxyTokenizationPayment()', () => {
        beforeEach(async () => {
            await service.loadVenmoCheckout(containerId);
        });

        it('tokenizes the payment through the venmo checkout', async () => {
            await service.proxyTokenizationPayment(methodId, cartId);

            expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();
        });

        it('requests the redirect url with wallet data and buyer billing/shipping address', async () => {
            await service.proxyTokenizationPayment(methodId, cartId);

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentWalletData: {
                        providerId: methodId,
                        providerOrderId: getTokenizePayload().nonce,
                    },
                    cartEntityId: cartId,
                    queryParams: expect.arrayContaining([
                        { key: 'payment_type', value: 'paypal' },
                        { key: 'action', value: 'set_external_checkout' },
                        { key: 'provider', value: methodId },
                        { key: 'device_data', value: dataCollector.deviceData },
                    ]),
                }),
            );
        });

        it('redirects the buyer to the external checkout url', async () => {
            await service.proxyTokenizationPayment(methodId, cartId);

            expect(window.location.assign).toHaveBeenCalledWith(externalCheckoutUrl);
        });

        it('rejects when the venmo tokenization fails', async () => {
            const tokenizeError = { type: 'UNKNOWN', code: '234' } as BraintreeError;

            braintreeVenmoCheckoutMock.tokenize = jest.fn(
                (
                    callback: (
                        error: BraintreeError | undefined,
                        payload: BraintreeTokenizePayload,
                    ) => void,
                ) => {
                    callback(tokenizeError, getTokenizePayload());
                },
            );

            await expect(service.proxyTokenizationPayment(methodId, cartId)).rejects.toBe(
                tokenizeError,
            );
        });

        it('throws when no external checkout url is returned', async () => {
            jest.spyOn(
                walletButtonIntegrationService,
                'getRedirectToCheckoutUrl',
            ).mockResolvedValue({
                body: { redirectUrls: null },
            } as Awaited<ReturnType<WalletButtonIntegrationService['getRedirectToCheckoutUrl']>>);

            await expect(service.proxyTokenizationPayment(methodId, cartId)).rejects.toThrow(
                BraintreePaypalWalletError,
            );
        });
    });

    describe('#removeElement()', () => {
        it('removes the element from the braintree integration service', () => {
            service.removeElement(containerId);

            expect(braintreeIntegrationService.removeElement).toHaveBeenCalledWith(containerId);
        });
    });
});
