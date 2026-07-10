import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletError from './braintree-paypal-wallet-error';
import BraintreePaypalWalletService from './braintree-paypal-wallet-service';

import {
    BraintreeDataCollector,
    BraintreeError,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    getDataCollectorMock,
    getPaypalCheckoutMock,
    getTokenizePayload,
    PaypalAuthorizeData,
} from './';

describe('BraintreePaypalWalletService', () => {
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let dataCollector: BraintreeDataCollector;
    let paymentIntegrationService: PaymentIntegrationService;
    let service: BraintreePaypalWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const containerId = 'braintree-paypal-wallet-mock-id';
    const methodId = 'braintreepaypal';
    const cartId = 'cart-123';
    const clientToken = 'clientToken';
    const externalCheckoutUrl = 'https://store.example/checkout.php?action=set_external_checkout';
    const authorizeData: PaypalAuthorizeData = { payerId: 'PAYER_ID' };

    const getSuccessCheckoutMock = () =>
        jest.fn(
            (_options: unknown, successCallback: (checkout: BraintreePaypalCheckout) => void) => {
                successCallback(braintreePaypalCheckoutMock);

                return Promise.resolve(braintreePaypalCheckoutMock);
            },
        );

    const getErrorCheckoutMock = () =>
        jest.fn(
            (
                _options: unknown,
                _successCallback: unknown,
                errorCallback: (error: BraintreeError) => void,
            ) => {
                errorCallback({ type: 'UNKNOWN', code: '234' } as BraintreeError);

                return Promise.resolve(braintreePaypalCheckoutMock);
            },
        );

    beforeEach(() => {
        dataCollector = getDataCollectorMock();
        braintreePaypalCheckoutMock = getPaypalCheckoutMock();
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

        service = new BraintreePaypalWalletService(
            walletButtonIntegrationService,
            braintreeIntegrationService,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize').mockImplementation(jest.fn());
        jest.spyOn(braintreeIntegrationService, 'teardown').mockResolvedValue();
        jest.spyOn(braintreeIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(braintreeIntegrationService, 'getPaypalCheckout').mockImplementation(
            getSuccessCheckoutMock(),
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

    describe('#loadPaypalCheckout()', () => {
        it('resolves with the braintree paypal checkout instance', async () => {
            const checkout = await service.loadPaypalCheckout({}, containerId);

            expect(checkout).toBe(braintreePaypalCheckoutMock);
        });

        it('removes the container and calls onError when checkout creation fails', async () => {
            const onError = jest.fn();

            jest.spyOn(braintreeIntegrationService, 'getPaypalCheckout').mockImplementation(
                getErrorCheckoutMock(),
            );

            await expect(
                service.loadPaypalCheckout({}, containerId, onError),
            ).rejects.toBeDefined();

            expect(braintreeIntegrationService.removeElement).toHaveBeenCalledWith(containerId);
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('#getBraintreePaypalCheckoutOrThrow()', () => {
        it('throws when the paypal checkout has not been loaded', () => {
            expect(() => service.getBraintreePaypalCheckoutOrThrow()).toThrow(
                PaymentMethodClientUnavailableError,
            );
        });

        it('returns the paypal checkout once loaded', async () => {
            await service.loadPaypalCheckout({}, containerId);

            expect(service.getBraintreePaypalCheckoutOrThrow()).toBe(braintreePaypalCheckoutMock);
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
            await service.loadPaypalCheckout({}, containerId);
        });

        it('tokenizes the payment with the authorize data', async () => {
            await service.proxyTokenizationPayment(authorizeData, methodId, cartId);

            expect(braintreePaypalCheckoutMock.tokenizePayment).toHaveBeenCalledWith(authorizeData);
        });

        it('requests the redirect url with wallet data and buyer billing/shipping address', async () => {
            await service.proxyTokenizationPayment(authorizeData, methodId, cartId);

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

        it('includes the buyer email in the billing address query param', async () => {
            await service.proxyTokenizationPayment(authorizeData, methodId, cartId);

            const [inputData] = (
                walletButtonIntegrationService.getRedirectToCheckoutUrl as jest.Mock
            ).mock.calls[0] as [{ queryParams: Array<{ key: string; value: string }> }];
            const billingAddressParam = inputData.queryParams.find(
                (param) => param.key === 'billing_address',
            );

            expect(JSON.parse(decodeURIComponent(billingAddressParam?.value ?? ''))).toEqual(
                expect.objectContaining({ email: getTokenizePayload().details.email }),
            );
        });

        it('redirects the buyer to the external checkout url', async () => {
            await service.proxyTokenizationPayment(authorizeData, methodId, cartId);

            expect(window.location.assign).toHaveBeenCalledWith(externalCheckoutUrl);
        });

        it('throws when no external checkout url is returned', async () => {
            jest.spyOn(
                walletButtonIntegrationService,
                'getRedirectToCheckoutUrl',
            ).mockResolvedValue({
                body: { redirectUrls: null },
            } as Awaited<ReturnType<WalletButtonIntegrationService['getRedirectToCheckoutUrl']>>);

            await expect(
                service.proxyTokenizationPayment(authorizeData, methodId, cartId),
            ).rejects.toThrow(BraintreePaypalWalletError);
        });
    });

    describe('#removeElement()', () => {
        it('removes the element from the braintree integration service', () => {
            service.removeElement(containerId);

            expect(braintreeIntegrationService.removeElement).toHaveBeenCalledWith(containerId);
        });
    });
});
