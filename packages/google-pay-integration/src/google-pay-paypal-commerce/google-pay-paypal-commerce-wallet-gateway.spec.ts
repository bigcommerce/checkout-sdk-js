import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';

import { googlePayConfigMock } from '../mocks/google-pay-config.mock';
import { getGeneric, getPayPalCommerce } from '../mocks/google-pay-payment-method.mock';

import GooglePayPayPalCommerceWalletGateway from './google-pay-paypal-commerce-wallet-gateway';

describe('GooglePayPayPalCommerceWalletGateway', () => {
    let gateway: GooglePayPayPalCommerceWalletGateway;
    let sdk: PayPalSdkScriptLoader;

    beforeEach(() => {
        sdk = new PayPalSdkScriptLoader(getScriptLoader());
        gateway = new GooglePayPayPalCommerceWalletGateway(sdk);

        jest.spyOn(sdk, 'getPayPalGooglePaySdk').mockResolvedValue({
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn().mockResolvedValue(googlePayConfigMock),
            }),
        });
    });

    it('loads the PayPal Google Pay SDK for a storefront wallet button', async () => {
        const paymentMethod = getPayPalCommerce();

        await gateway.initialize(paymentMethod, 'USD');

        expect(sdk.getPayPalGooglePaySdk).toHaveBeenCalledWith(
            paymentMethod,
            'USD',
            undefined,
            false,
        );
        expect(gateway.getPaymentGatewayParameters()).toEqual({
            gateway: 'paypalppcp',
            gatewayMerchantId: 'ID',
        });
    });

    it('rejects a Google Pay config without allowed payment methods', async () => {
        jest.spyOn(sdk, 'getPayPalGooglePaySdk').mockResolvedValue({
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn().mockResolvedValue({
                    ...googlePayConfigMock,
                    allowedPaymentMethods: [],
                }),
            }),
        });

        await expect(gateway.initialize(getPayPalCommerce(), 'USD')).rejects.toThrow(
            'Google Pay tokenization specification is missing',
        );
    });

    it('returns merchant information from the payment method', async () => {
        await gateway.initialize(getPayPalCommerce(), 'USD');

        expect(gateway.getMerchantInfo()).toEqual({
            merchantName: 'Example Merchant',
            merchantId: '12345678901234567890',
            authJwt: 'foo.bar.baz',
        });
    });

    it('maps supported cards and requires a full billing address', async () => {
        const paymentMethod = getPayPalCommerce();

        paymentMethod.supportedCards = ['VISA', 'MC', 'unsupported'];

        await gateway.initialize(paymentMethod, 'USD');

        expect(gateway.getCardParameters()).toEqual({
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD'],
            billingAddressRequired: true,
            billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
        });
    });

    it('uses PayPal Commerce wallet tokenization identifiers', () => {
        expect(gateway.getTokenizationConfig()).toEqual({
            providerId: 'paypalcommerce.googlepay',
            paymentType: 'googlepay',
            methodId: 'paypalcommercegooglepay',
        });
    });

    it('rejects missing initialization data before loading the SDK', async () => {
        const paymentMethod = getPayPalCommerce();

        paymentMethod.initializationData = undefined;

        await expect(gateway.initialize(paymentMethod, 'USD')).rejects.toThrow(MissingDataError);
        expect(sdk.getPayPalGooglePaySdk).not.toHaveBeenCalled();
    });

    it('propagates SDK loading errors for invalid initialization data', async () => {
        const paymentMethod = getGeneric();
        const error = new MissingDataError(MissingDataErrorType.MissingPaymentMethod);

        jest.spyOn(sdk, 'getPayPalGooglePaySdk').mockRejectedValue(error);

        await expect(gateway.initialize(paymentMethod, 'USD')).rejects.toBe(error);
        expect(sdk.getPayPalGooglePaySdk).toHaveBeenCalledWith(
            paymentMethod,
            'USD',
            undefined,
            false,
        );
    });

    it('requires initialization before returning merchant and card information', () => {
        expect(() => gateway.getMerchantInfo()).toThrow(MissingDataError);
        expect(() => gateway.getCardParameters()).toThrow(MissingDataError);
    });

    it('rejects missing gateway merchant IDs', () => {
        expect(() => gateway.getPaymentGatewayParameters()).toThrow(
            'Unable to proceed, gatewayMerchantId or gatewayIdentifier is missing.',
        );
    });
});
