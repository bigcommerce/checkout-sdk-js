import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
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

    it('returns PayPal Commerce redirect data', async () => {
        const response = getCardDataResponse();

        await expect(gateway.getRedirectData(response)).resolves.toEqual({
            paymentWalletData: { providerId: 'paypalcommerce.googlepay' },
            queryParams: [
                { key: 'payment_type', value: 'googlepay' },
                { key: 'provider', value: 'googlepay_paypalcommerce' },
                { key: 'nonce', value: btoa(response.paymentMethodData.tokenizationData.token) },
                {
                    key: 'card_information',
                    value: JSON.stringify({ type: 'VISA', number: '1111' }),
                },
            ],
        });
    });

    it('rejects missing initialization data before loading the SDK', async () => {
        const paymentMethod = getPayPalCommerce();

        paymentMethod.initializationData = undefined;

        await expect(gateway.initialize(paymentMethod, 'USD')).rejects.toThrow(MissingDataError);
        expect(sdk.getPayPalGooglePaySdk).not.toHaveBeenCalled();
    });

    it('rejects payment data without PayPal initialization fields before loading the SDK', async () => {
        const paymentMethod = getGeneric();

        await expect(gateway.initialize(paymentMethod, 'USD')).rejects.toThrow(MissingDataError);
        expect(sdk.getPayPalGooglePaySdk).not.toHaveBeenCalled();
    });

    it('propagates PayPal SDK loading errors', async () => {
        const paymentMethod = getPayPalCommerce();
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

    it('rejects missing gateway merchant IDs', () => {
        expect(() => gateway.getPaymentGatewayParameters()).toThrow(
            'Unable to proceed, gatewayMerchantId or gatewayIdentifier is missing.',
        );
    });

    it('deinitializes without tearing down the shared PayPal SDK', async () => {
        await expect(gateway.deinitialize()).resolves.toBeUndefined();
    });
});
