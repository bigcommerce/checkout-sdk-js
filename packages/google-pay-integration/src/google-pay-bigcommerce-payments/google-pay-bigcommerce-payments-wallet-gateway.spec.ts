import { getScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { googlePayConfigMock } from '../mocks/google-pay-config.mock';
import { getBigCommercePayments, getBraintree } from '../mocks/google-pay-payment-method.mock';

import GooglePayBigCommercePaymentsWalletGateway from './google-pay-bigcommerce-payments-wallet-gateway';

describe('GooglePayBigCommercePaymentsWalletGateway', () => {
    let gateway: GooglePayBigCommercePaymentsWalletGateway;
    let sdk: PayPalSdkScriptLoader;

    const paymentMethod = () => ({
        ...getBigCommercePayments(),
        id: 'bigcommerce_paymentsgooglepay',
    });

    beforeEach(() => {
        sdk = new PayPalSdkScriptLoader(getScriptLoader());
        gateway = new GooglePayBigCommercePaymentsWalletGateway(sdk);

        jest.spyOn(sdk, 'getPayPalGooglePaySdk').mockResolvedValue({
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn().mockResolvedValue({
                    ...googlePayConfigMock,
                    allowedPaymentMethods: [
                        {
                            ...googlePayConfigMock.allowedPaymentMethods[0],
                            tokenizationSpecification: {
                                type: 'PAYMENT_GATEWAY',
                                parameters: {
                                    gateway: 'bigcommercepaymentsgooglepay',
                                    gatewayMerchantId: 'bcp-merchant-id',
                                },
                            },
                        },
                    ],
                }),
            }),
        });
    });

    it('loads the BCP Google Pay SDK and uses its tokenization parameters', async () => {
        const method = paymentMethod();

        await gateway.initialize(method, 'USD');

        expect(sdk.getPayPalGooglePaySdk).toHaveBeenCalledWith(method, 'USD', undefined, false);
        expect(gateway.getPaymentGatewayParameters()).toEqual({
            gateway: 'bigcommercepaymentsgooglepay',
            gatewayMerchantId: 'bcp-merchant-id',
        });
    });

    it('returns BigCommerce Payments redirect data', async () => {
        const response = getCardDataResponse();
        const redirectData = await gateway.getRedirectData(response);

        expect(redirectData).toEqual({
            paymentWalletData: { providerId: 'bigcommerce_payments.googlepay' },
            queryParams: [
                { key: 'payment_type', value: 'googlepay' },
                { key: 'provider', value: 'googlepay_bigcommerce_payments' },
                { key: 'nonce', value: btoa(response.paymentMethodData.tokenizationData.token) },
                {
                    key: 'card_information',
                    value: JSON.stringify({ type: 'VISA', number: '1111' }),
                },
            ],
        });
    });

    it('requires gateway parameters to be initialized before returning them', () => {
        expect(() => gateway.getPaymentGatewayParameters()).toThrow(
            'Unable to proceed, gatewayMerchantId or gatewayIdentifier is missing.',
        );
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

        await expect(gateway.initialize(paymentMethod(), 'USD')).rejects.toThrow(
            'Google Pay tokenization specification is missing',
        );
    });

    it('rejects missing payment method initialization data before loading the SDK', async () => {
        const method = paymentMethod();

        method.initializationData = undefined;

        await expect(gateway.initialize(method, 'USD')).rejects.toThrow(MissingDataError);
        expect(sdk.getPayPalGooglePaySdk).not.toHaveBeenCalled();
    });

    it('rejects payment data without PayPal initialization fields before loading the SDK', async () => {
        const method = getBraintree();

        await expect(gateway.initialize(method, 'USD')).rejects.toThrow(MissingDataError);
        expect(sdk.getPayPalGooglePaySdk).not.toHaveBeenCalled();
    });
});
