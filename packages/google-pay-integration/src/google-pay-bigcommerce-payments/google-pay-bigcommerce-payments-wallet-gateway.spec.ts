import { getScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';

import { googlePayConfigMock } from '../mocks/google-pay-config.mock';
import { getBigCommercePayments } from '../mocks/google-pay-payment-method.mock';

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

    it('uses BigCommerce Payments tokenization identifiers', () => {
        expect(gateway.getTokenizationConfig()).toEqual({
            providerId: 'bigcommerce_payments.googlepay',
            paymentType: 'googlepay',
            methodId: 'googlepay_bigcommerce_payments',
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
});
