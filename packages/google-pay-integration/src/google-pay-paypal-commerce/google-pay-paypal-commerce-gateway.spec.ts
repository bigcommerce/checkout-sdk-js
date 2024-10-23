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
    const googlePayConfigMock = {
        allowedPaymentMethods: [
            {
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                    billingAddressParameters: { format: 'FULL' },
                    billingAddressRequired: true,
                    assuranceDetailsRequired: false,
                },
                tokenizationSpecification: {
                    parameters: {
                        gateway: 'paypalppcp',
                        gatewayMerchantId: 'ID',
                    },
                    type: 'PAYMENT_GATEWAY',
                },
                type: 'CARD',
            },
        ],
        apiVersion: 2,
        apiVersionMinor: 2,
        countryCode: 'US',
        isEligible: true,
        merchantInfo: {
            merchantId: 'id',
            merchantOrigin: 'origin',
        },
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

        gateway = new GooglePayPayPalCommerceGateway(paymentIntegrationService, scriptLoader);
        jest.spyOn(scriptLoader, 'getGooglePayConfigOrThrow').mockResolvedValue({
            ...googlePayConfigMock,
            allowedPaymentMethods: [
                {
                    ...googlePayConfigMock.allowedPaymentMethods[0],
                    tokenizationSpecification: {
                        ...googlePayConfigMock.allowedPaymentMethods[0].tokenizationSpecification,
                        parameters: {
                            gateway: 'paypalsb',
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

        it('should return payment gateway parameters in production mode', async () => {
            jest.spyOn(scriptLoader, 'getGooglePayConfigOrThrow').mockResolvedValue(
                googlePayConfigMock,
            );

            const expectedParams = {
                gateway: 'paypalppcp',
                gatewayMerchantId: 'ID',
            };

            const googlePayPaymentMethod = getPayPalCommerce();

            isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

            await gateway.initialize(() => googlePayPaymentMethod);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        it('should return default payment gateway name', async () => {
            jest.spyOn(scriptLoader, 'getGooglePayConfigOrThrow').mockResolvedValue({
                ...googlePayConfigMock,
                allowedPaymentMethods: [
                    {
                        ...googlePayConfigMock.allowedPaymentMethods[0],
                        tokenizationSpecification: {
                            ...googlePayConfigMock.allowedPaymentMethods[0]
                                .tokenizationSpecification,
                            parameters: {
                                gateway: '',
                                gatewayMerchantId: 'ID',
                            },
                        },
                    },
                ],
            });

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
