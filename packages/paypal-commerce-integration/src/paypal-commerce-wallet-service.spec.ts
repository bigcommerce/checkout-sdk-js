import {
    MissingDataError,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    AddressRequestBody,
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { getPayPalCommercePaymentMethod, getPayPalSDKMock } from './mocks';
import PayPalCommerceScriptLoader from './paypal-commerce-script-loader';
import {
    PayPalButtonStyleOptions,
    PayPalSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './paypal-commerce-types';
import PaypalCommerceWalletService from './paypal-commerce-wallet-service';

describe('PaypalCommerceWalletService', () => {
    let paymentMethod: ReturnType<typeof getPayPalCommercePaymentMethod>;
    let paypalCommerceScriptLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;
    let service: PaypalCommerceWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const cartId = 'cart-123';
    const orderId = 'order-123';
    const externalCheckoutUrl = 'https://store.example/checkout.php?action=set_external_checkout';

    beforeEach(() => {
        paymentMethod = getPayPalCommercePaymentMethod();
        paypalSdk = getPayPalSDKMock();
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
        paypalCommerceScriptLoader = new PayPalCommerceScriptLoader({} as never);

        service = new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            paypalCommerceScriptLoader,
        );

        jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockResolvedValue(paypalSdk);
        jest.spyOn(walletButtonIntegrationService, 'getRedirectToCheckoutUrl').mockResolvedValue({
            body: { redirectUrls: { externalCheckoutUrl } },
        } as Awaited<ReturnType<WalletButtonIntegrationService['getRedirectToCheckoutUrl']>>);
        jest.spyOn(walletButtonIntegrationService, 'createPaymentOrderIntent').mockResolvedValue({
            body: { orderId },
        } as Awaited<ReturnType<WalletButtonIntegrationService['createPaymentOrderIntent']>>);
        jest.spyOn(walletButtonIntegrationService, 'addBillingAddress').mockResolvedValue({
            body: {},
            headers: {},
            status: 200,
            statusText: 'OK',
        } as Awaited<ReturnType<WalletButtonIntegrationService['addBillingAddress']>>);

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { assign: jest.fn() },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates an instance of PaypalCommerceWalletService', () => {
        expect(service).toBeInstanceOf(PaypalCommerceWalletService);
    });

    describe('#loadPayPalSdk', () => {
        it('loads and returns paypal sdk', async () => {
            const output = await service.loadPayPalSdk(paymentMethod, 'USD', true, true);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethod,
                'USD',
                undefined,
                true,
                true,
            );
            expect(output).toBe(paypalSdk);
        });
    });

    describe('#getPayPalSdkOrThrow', () => {
        it('returns paypal sdk if it was loaded earlier', async () => {
            await service.loadPayPalSdk(paymentMethod, 'USD');

            const output = service.getPayPalSdkOrThrow();

            expect(output).toBe(paypalSdk);
        });

        it('throws an error if paypal sdk is not defined', () => {
            expect(() => service.getPayPalSdkOrThrow()).toThrow(
                PaymentMethodClientUnavailableError,
            );
        });
    });

    describe('#proxyTokenizationPayment', () => {
        it('throws if order id is missing', async () => {
            await expect(service.proxyTokenizationPayment(cartId)).rejects.toThrow(
                MissingDataError,
            );
        });

        it('requests external checkout url and redirects customer', async () => {
            await service.proxyTokenizationPayment(cartId, orderId);

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith({
                paymentWalletData: {
                    providerId: 'paypalcommerce',
                    providerOrderId: orderId,
                },
                cartEntityId: cartId,
                queryParams: [
                    { key: 'payment_type', value: 'paypal' },
                    { key: 'action', value: 'set_external_checkout' },
                    { key: 'provider', value: 'paypalcommerce' },
                ],
            });
            expect(window.location.assign).toHaveBeenCalledWith(externalCheckoutUrl);
        });

        it('throws if checkout response does not contain redirect url', async () => {
            jest.spyOn(
                walletButtonIntegrationService,
                'getRedirectToCheckoutUrl',
            ).mockResolvedValue({
                body: { redirectUrls: null },
                headers: {},
                status: 200,
                statusText: 'OK',
            } as Awaited<ReturnType<WalletButtonIntegrationService['getRedirectToCheckoutUrl']>>);

            await expect(service.proxyTokenizationPayment(cartId, orderId)).rejects.toThrow(
                'Failed to redirection to checkout page',
            );
        });
    });

    describe('#createPaymentOrderIntent', () => {
        it('creates payment order intent and returns order id', async () => {
            const output = await service.createPaymentOrderIntent('paypalcommerce', cartId, {
                headers: { 'x-test': 'value' },
            });

            expect(walletButtonIntegrationService.createPaymentOrderIntent).toHaveBeenCalledWith(
                {
                    cartEntityId: cartId,
                    paymentWalletEntityId: 'paypalcommerce',
                },
                { headers: { 'x-test': 'value' } },
            );
            expect(output).toBe(orderId);
        });
    });

    describe('#addBillingAddress', () => {
        it('passes billing address payload to wallet button service', async () => {
            const address = { city: 'Austin' } as AddressRequestBody;

            await service.addBillingAddress(cartId, address, {
                headers: { 'x-test': 'value' },
            });

            expect(walletButtonIntegrationService.addBillingAddress).toHaveBeenCalledWith(
                cartId,
                address,
                { headers: { 'x-test': 'value' } },
            );
        });
    });

    describe('#getValidButtonStyle', () => {
        it('returns only valid style fields', () => {
            const style = {
                color: StyleButtonColor.gold,
                height: 60,
                label: StyleButtonLabel.pay,
                shape: StyleButtonShape.pill,
            } as PayPalButtonStyleOptions;

            const output = service.getValidButtonStyle(style);

            expect(output).toEqual({
                color: StyleButtonColor.gold,
                height: 55,
                label: StyleButtonLabel.pay,
                shape: StyleButtonShape.pill,
            });
        });

        it('omits invalid fields and uses default height', () => {
            const style = {
                color: 'invalid',
                height: undefined,
                label: 'invalid',
                shape: 'invalid',
            } as unknown as PayPalButtonStyleOptions;

            const output = service.getValidButtonStyle(style);

            expect(output).toEqual({
                height: 40,
            });
        });
    });

    describe('#getValidHeight', () => {
        it('returns default height when height is not provided', () => {
            expect(service.getValidHeight()).toBe(40);
        });

        it('returns min height when value is too small', () => {
            expect(service.getValidHeight(1)).toBe(25);
        });

        it('returns max height when value is too large', () => {
            expect(service.getValidHeight(100)).toBe(55);
        });

        it('returns provided value when it is in range', () => {
            expect(service.getValidHeight(35)).toBe(35);
        });
    });

    describe('#removeElement', () => {
        it('hides the element when it exists', () => {
            document.body.innerHTML = '<div id="wallet-container"></div>';

            service.removeElement('wallet-container');

            expect(document.getElementById('wallet-container')?.style.display).toBe('none');
        });

        it('does not throw when element id is not provided', () => {
            expect(() => service.removeElement()).not.toThrow();
        });

        it('does not throw when element is not found', () => {
            expect(() => service.removeElement('missing-id')).not.toThrow();
        });
    });
});
