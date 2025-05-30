import { getScriptLoader } from '@bigcommerce/script-loader';

import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from '../gateways/google-pay-gateway';
import isGooglePayPaypalCommercePaymentMethod from '../guards/is-google-pay-paypal-commerce-payment-method';
import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { googlePayConfigMock } from '../mocks/google-pay-config.mock';
import { getBigCommercePayments } from '../mocks/google-pay-payment-method.mock';

import GooglePayBigCommercePaymentsGateway from './google-pay-bigcommerce-payments-gateway';

describe('GooglePayBigCommercePaymentsGateway', () => {
    let gateway: GooglePayBigCommercePaymentsGateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: PayPalSdkHelper;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = new PayPalSdkHelper(getScriptLoader());

        gateway = new GooglePayBigCommercePaymentsGateway(paymentIntegrationService, scriptLoader);

        jest.spyOn(scriptLoader, 'getPayPalGooglePaySdk').mockResolvedValue({
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn().mockReturnValue(googlePayConfigMock),
                confirmOrder: jest.fn().mockResolvedValue({ status: 'APPROVED' }),
            }),
        });
    });

    it('is a special type of GooglePayGateway', () => {
        expect(gateway).toBeInstanceOf(GooglePayGateway);
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const response = getCardDataResponse();

            response.paymentMethodData.tokenizationData.token = '{"id":"tok_f00b4r"}';

            const expectedData = {
                nonce: 'eyJpZCI6InRva19mMDBiNHIifQ==',
                card_information: {
                    type: 'VISA',
                    number: '1111',
                },
            };

            const mappedData = await gateway.mapToExternalCheckoutData(response);

            expect(mappedData).toStrictEqual(expectedData);
        });
    });

    describe('#getPaymentGatewayParameters', () => {
        it('should return payment gateway parameters', async () => {
            const expectedParams = {
                gateway: 'paypalppcp',
                gatewayMerchantId: 'ID',
            };

            const googlePayPaymentMethod = getBigCommercePayments();

            isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

            await gateway.initialize(() => googlePayPaymentMethod);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        it('should return payment gateway parameters in production mode', async () => {
            const expectedParams = {
                gateway: 'paypalppcp',
                gatewayMerchantId: 'ID',
            };

            const googlePayPaymentMethod = getBigCommercePayments();

            isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

            await gateway.initialize(() => googlePayPaymentMethod);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        it('should return default payment gateway name', async () => {
            const expectedParams = {
                gateway: 'paypalppcp',
                gatewayMerchantId: 'ID',
            };

            const googlePayPaymentMethod = getBigCommercePayments();

            isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

            await gateway.initialize(() => googlePayPaymentMethod);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });
    });
});
