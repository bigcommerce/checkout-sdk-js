import {
    MissingDataError,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    AddressRequestBody,
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { getPayPalPaymentMethod, getPayPalSDKMock } from './mocks';
import PayPalSdkScriptLoader from './paypal-sdk-script-loader';
import {
    PayPalButtonStyleOptions,
    PayPalSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './paypal-types';
import PaypalCommerceWalletService from './paypal-wallet-service';

describe('PaypalCommerceWalletService', () => {
    let paymentMethod: ReturnType<typeof getPayPalPaymentMethod>;
    let scriptLoader: jest.Mocked<Pick<PayPalSdkScriptLoader, 'getPayPalSDK'>>;
    let paypalSdk: PayPalSDK;
    let service: PaypalCommerceWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const cartId = 'cart-123';
    const orderId = 'order-123';
    const externalCheckoutUrl = 'https://store.example/checkout.php?action=set_external_checkout';

    beforeEach(() => {
        paymentMethod = getPayPalPaymentMethod();
        paypalSdk = getPayPalSDKMock();
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
        scriptLoader = { getPayPalSDK: jest.fn().mockResolvedValue(paypalSdk) };

        service = new PaypalCommerceWalletService(walletButtonIntegrationService, scriptLoader);

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

            expect(scriptLoader.getPayPalSDK).toHaveBeenCalledWith(
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

            expect(service.getPayPalSdkOrThrow()).toBe(paypalSdk);
        });

        it('throws an error if paypal sdk is not defined', () => {
            expect(() => service.getPayPalSdkOrThrow()).toThrow(
                PaymentMethodClientUnavailableError,
            );
        });
    });

    describe('#proxyTokenizationPayment', () => {
        it('throws if order id is missing', async () => {
            await expect(
                service.proxyTokenizationPayment(cartId, 'paypalcommerce', 'paypalcommerce'),
            ).rejects.toThrow(MissingDataError);
        });

        it('requests external checkout url and redirects customer', async () => {
            await service.proxyTokenizationPayment(
                cartId,
                'paypalcommerce',
                'paypalcommerce',
                orderId,
            );

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
                    { key: 'order_id', value: orderId },
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

            await expect(
                service.proxyTokenizationPayment(
                    cartId,
                    'paypalcommerce',
                    'paypalcommerce',
                    orderId,
                ),
            ).rejects.toThrow('Failed to redirection to checkout page');
        });
    });

    describe('#createPaymentOrderIntent', () => {
        it('uses the default PayPalCommercePaymentWalletIntentData typename', async () => {
            await service.createPaymentOrderIntent('paypalcommerce', cartId);

            expect(walletButtonIntegrationService.createPaymentOrderIntent).toHaveBeenCalledWith(
                { cartEntityId: cartId, paymentWalletEntityId: 'paypalcommerce' },
                'PayPalCommercePaymentWalletIntentData',
                undefined,
            );
        });

        it('uses a custom intentTypename when provided at construction', async () => {
            const customService = new PaypalCommerceWalletService(
                walletButtonIntegrationService,
                scriptLoader,
                'BigcommercePaymentWalletIntentData',
            );

            await customService.createPaymentOrderIntent('bigcommerce_payments.paypal', cartId);

            expect(walletButtonIntegrationService.createPaymentOrderIntent).toHaveBeenCalledWith(
                { cartEntityId: cartId, paymentWalletEntityId: 'bigcommerce_payments.paypal' },
                'BigcommercePaymentWalletIntentData',
                undefined,
            );
        });

        it('returns the order id from the response', async () => {
            const output = await service.createPaymentOrderIntent('paypalcommerce', cartId);

            expect(output).toBe(orderId);
        });
    });

    describe('#addBillingAddress', () => {
        it('passes billing address to wallet button service', async () => {
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

    describe('#mapOrderDetailsToBillingAddress', () => {
        it('maps order details to a billing address', () => {
            const output = service.mapOrderDetailsToBillingAddress({
                payer: {
                    name: { given_name: 'John', surname: 'Doe' },
                    email_address: 'john@doe.com',
                    address: {
                        address_line_1: '123 Main St',
                        address_line_2: 'Suite 100',
                        admin_area_2: 'Austin',
                        admin_area_1: 'TX',
                        postal_code: '73301',
                        country_code: 'US',
                    },
                    phone: { phone_number: { national_number: '5555555555' } },
                },
                purchase_units: [],
            } as never);

            expect(output).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: '123 Main St',
                address2: 'Suite 100',
                city: 'Austin',
                email: 'john@doe.com',
                stateOrProvince: 'TX',
                stateOrProvinceCode: 'TX',
                countryCode: 'US',
                postalCode: '73301',
                phone: '5555555555',
                shouldSaveAddress: false,
            });
        });

        it('falls back to empty strings when phone and state are absent', () => {
            const output = service.mapOrderDetailsToBillingAddress({
                payer: {
                    name: { given_name: 'Jane', surname: 'Smith' },
                    email_address: 'jane@smith.com',
                    address: {
                        address_line_1: '1 High St',
                        address_line_2: '',
                        admin_area_2: 'London',
                        admin_area_1: undefined,
                        postal_code: 'SW1A 1AA',
                        country_code: 'GB',
                    },
                },
                purchase_units: [],
            } as never);

            expect(output).toEqual(
                expect.objectContaining({
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                    phone: '',
                }),
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

            expect(service.getValidButtonStyle(style)).toEqual({
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

            expect(service.getValidButtonStyle(style)).toEqual({ height: 40 });
        });
    });

    describe('#getValidHeight', () => {
        it('returns default height when not provided', () => {
            expect(service.getValidHeight()).toBe(40);
        });

        it('returns min height when value is too small', () => {
            expect(service.getValidHeight(1)).toBe(25);
        });

        it('returns max height when value is too large', () => {
            expect(service.getValidHeight(100)).toBe(55);
        });

        it('returns provided value when in range', () => {
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
