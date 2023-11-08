import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from '../gateways/google-pay-gateway';
import isGooglePayPaypalCommercePaymentMethod from '../guards/is-google-pay-paypal-commerce-payment-method';
import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getPayPalCommerce } from '../mocks/google-pay-payment-method.mock';

import GooglePayPayPalCommerceGateway from './google-pay-paypal-commerce-gateway';
import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';

describe('GooglePayPayPalCommerceGateway', () => {
    let gateway: GooglePayPayPalCommerceGateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: PayPalCommerceScriptLoader;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

        gateway = new GooglePayPayPalCommerceGateway(paymentIntegrationService, scriptLoader);
        jest.spyOn(scriptLoader, 'getGooglePayConfigOrThrow').mockResolvedValue({
            allowedPaymentMethods: [
                {
                    tokenizationSpecification: {
                        parameters: {
                            gatewayMerchantId: 'ID',
                        },
                    },
                },
            ],
        });

        jest.spyOn(scriptLoader, 'getPayPalSDK').mockResolvedValue({
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn().mockReturnValue({}),
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
                gateway: 'paypalsb',
                gatewayMerchantId: 'ID',
            };

            const googlePayPaymentMethod = getPayPalCommerce();

            isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

            await gateway.initialize(() => googlePayPaymentMethod);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });
    });
});
