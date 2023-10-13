import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    NotInitializedError,
    PaymentIntegrationService,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from './gateways/google-pay-gateway';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import GooglePayScriptLoader from './google-pay-script-loader';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getGeneric } from './mocks/google-pay-payment-method.mock';
import getGooglePaymentsClientMocks from './mocks/google-pay-payments-client.mock';
import {
    GooglePayAdditionalActionProcessable,
    GooglePayButtonOptions,
    GooglePaymentsClient,
} from './types';

describe('GooglePayPaymentProcessor', () => {
    let clientMocks: ReturnType<typeof getGooglePaymentsClientMocks>;
    let paymentsClient: GooglePaymentsClient;
    let scriptLoader: GooglePayScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let gateway: GooglePayGateway;
    let requestSender: RequestSender;
    let formPoster: FormPoster;
    let processor: GooglePayPaymentProcessor;

    beforeEach(() => {
        clientMocks = getGooglePaymentsClientMocks();
        paymentsClient = clientMocks.paymentsClient;
        scriptLoader = new GooglePayScriptLoader(createScriptLoader());
        jest.spyOn(scriptLoader, 'getGooglePaymentsClient').mockResolvedValue(paymentsClient);

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        gateway = new GooglePayGateway('example', paymentIntegrationService);
        jest.spyOn(gateway, 'initialize');
        jest.spyOn(gateway, 'getCardParameters');
        jest.spyOn(gateway, 'getPaymentGatewayParameters');
        jest.spyOn(gateway, 'getTransactionInfo');
        jest.spyOn(gateway, 'getMerchantInfo');
        jest.spyOn(gateway, 'getRequiredData');
        jest.spyOn(gateway, 'mapToExternalCheckoutData');
        jest.spyOn(gateway, 'mapToBillingAddressRequestBody');
        jest.spyOn(gateway, 'mapToShippingAddressRequestBody');

        requestSender = createRequestSender();
        jest.spyOn(requestSender, 'post').mockResolvedValue(undefined);

        formPoster = createFormPoster();
        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback) =>
            callback(),
        );

        processor = new GooglePayPaymentProcessor(scriptLoader, gateway, requestSender, formPoster);
    });

    describe('#initialize', () => {
        it('should initialize the processor', async () => {
            const initialize = processor.initialize(getGeneric);

            await expect(initialize).resolves.toBeUndefined();
        });

        it('should load google payments client', async () => {
            await processor.initialize(getGeneric);

            expect(scriptLoader.getGooglePaymentsClient).toHaveBeenCalledWith(true, undefined);
        });

        it('should initialize the gateway', async () => {
            await processor.initialize(getGeneric);

            expect(gateway.initialize).toHaveBeenCalledWith(getGeneric, false);
        });

        it('should build payloads', async () => {
            await processor.initialize(getGeneric);

            expect(gateway.getCardParameters).toHaveBeenCalled();
            expect(gateway.getPaymentGatewayParameters).toHaveBeenCalled();
            expect(gateway.getTransactionInfo).toHaveBeenCalled();
            expect(gateway.getMerchantInfo).toHaveBeenCalled();
            expect(gateway.getRequiredData).toHaveBeenCalled();
        });

        it('should determine readiness to pay', async () => {
            const expectedRequest = {
                allowedPaymentMethods: [
                    {
                        parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                            billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
                            billingAddressRequired: true,
                        },
                        type: 'CARD',
                    },
                ],
                apiVersion: 2,
                apiVersionMinor: 0,
            };

            await processor.initialize(getGeneric);

            expect(paymentsClient.isReadyToPay).toHaveBeenCalledWith(expectedRequest);
        });

        it('should prefetch google payment data', async () => {
            const expectedRequest = {
                allowedPaymentMethods: [
                    {
                        parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                            billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
                            billingAddressRequired: true,
                        },
                        tokenizationSpecification: {
                            parameters: {
                                gateway: 'example',
                                gatewayMerchantId: 'exampleGatewayMerchantId',
                            },
                            type: 'PAYMENT_GATEWAY',
                        },
                        type: 'CARD',
                    },
                ],
                apiVersion: 2,
                apiVersionMinor: 0,
                emailRequired: true,
                merchantInfo: {
                    authJwt: 'foo.bar.baz',
                    merchantId: '12345678901234567890',
                    merchantName: 'Example Merchant',
                },
                transactionInfo: {
                    countryCode: 'US',
                    currencyCode: 'USD',
                    totalPrice: '190.00',
                    totalPriceStatus: 'FINAL',
                },
            };

            await processor.initialize(getGeneric);

            expect(paymentsClient.prefetchPaymentData).toHaveBeenCalledWith(expectedRequest);
        });

        it('should prefetch google payment data with shipping address', async () => {
            const expectedRequest = expect.objectContaining({
                shippingAddressRequired: true,
                shippingAddressParameters: {
                    phoneNumberRequired: true,
                    allowedCountryCodes: ['AU', 'US', 'JP'],
                },
            });

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getShippingAddress',
            ).mockReturnValueOnce(undefined);

            await processor.initialize(getGeneric);

            expect(paymentsClient.prefetchPaymentData).toHaveBeenCalledWith(expectedRequest);
        });

        it('should update the transaction info', async () => {
            await processor.initialize(getGeneric);

            expect(gateway.getTransactionInfo).toHaveBeenCalledTimes(2);
        });

        describe('should fail if:', () => {
            test('google pay is not supported', async () => {
                jest.spyOn(paymentsClient, 'isReadyToPay').mockResolvedValue({ result: false });

                const initialize = processor.initialize(getGeneric);

                await expect(initialize).rejects.toThrow(
                    'Google Pay is not supported by the current device and browser, please try another payment method.',
                );
            });

            test('google pay encounters an error', async () => {
                jest.spyOn(paymentsClient, 'isReadyToPay').mockRejectedValue(
                    new Error('Developer error!'),
                );

                const initialize = processor.initialize(getGeneric);

                await expect(initialize).rejects.toThrow(PaymentMethodFailedError);
            });
        });
    });

    describe('#addPaymentButton', () => {
        const CONTAINER_ID = 'my_awesome_google_pay_button_container';
        let buttonOptions: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>;
        let container: HTMLDivElement;

        beforeAll(() => {
            buttonOptions = {
                onClick: jest.fn(),
            };

            container = document.createElement('div');

            jest.spyOn(container, 'appendChild');

            container.id = CONTAINER_ID;
            document.body.appendChild(container);
        });

        it('should add payment button', async () => {
            await processor.initialize(getGeneric);

            expect(processor.addPaymentButton(CONTAINER_ID, buttonOptions)).toBe(
                clientMocks.button,
            );
        });

        it('should create payment button', async () => {
            const expectedOptions = {
                allowedPaymentMethods: [
                    {
                        parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                            billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
                            billingAddressRequired: true,
                        },
                        type: 'CARD',
                    },
                ],
                ...buttonOptions,
            };

            await processor.initialize(getGeneric);
            processor.addPaymentButton(CONTAINER_ID, buttonOptions);

            expect(paymentsClient.createButton).toHaveBeenCalledWith(expectedOptions);
        });

        it('should append payment button', async () => {
            await processor.initialize(getGeneric);
            processor.addPaymentButton(CONTAINER_ID, buttonOptions);

            expect(container.appendChild).toHaveBeenCalledWith(clientMocks.button);
        });

        describe('should fail if:', () => {
            test('an invalid container is provided', async () => {
                await processor.initialize(getGeneric);

                const addPaymentButton = () =>
                    processor.addPaymentButton('wrong_container_id', buttonOptions);

                expect(addPaymentButton).toThrow(
                    'Unable to render the Google Pay button to an invalid HTML container element.',
                );
            });

            test('not initialized', () => {
                const addPaymentButton = () =>
                    processor.addPaymentButton(CONTAINER_ID, buttonOptions);

                expect(addPaymentButton).toThrow(NotInitializedError);
            });
        });
    });

    describe('#showPaymentSheet', () => {
        it('should show the payment sheet', async () => {
            await processor.initialize(getGeneric);

            await expect(processor.showPaymentSheet()).resolves.toBe(clientMocks.cardDataResponse);
        });

        it('should update the transaction info', async () => {
            await processor.initialize(getGeneric);
            await processor.showPaymentSheet();

            expect(gateway.getTransactionInfo).toHaveBeenCalledTimes(3);
        });

        it('should load google payment data', async () => {
            const expectedRequest = {
                allowedPaymentMethods: [
                    {
                        parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                            billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
                            billingAddressRequired: true,
                        },
                        tokenizationSpecification: {
                            parameters: {
                                gateway: 'example',
                                gatewayMerchantId: 'exampleGatewayMerchantId',
                            },
                            type: 'PAYMENT_GATEWAY',
                        },
                        type: 'CARD',
                    },
                ],
                apiVersion: 2,
                apiVersionMinor: 0,
                emailRequired: true,
                merchantInfo: {
                    authJwt: 'foo.bar.baz',
                    merchantId: '12345678901234567890',
                    merchantName: 'Example Merchant',
                },
                transactionInfo: {
                    countryCode: 'US',
                    currencyCode: 'USD',
                    totalPrice: '190.00',
                    totalPriceStatus: 'FINAL',
                },
            };

            await processor.initialize(getGeneric);
            await processor.showPaymentSheet();

            expect(paymentsClient.loadPaymentData).toHaveBeenCalledWith(expectedRequest);
        });

        it('should load payment data with shipping address', async () => {
            const expectedRequest = expect.objectContaining({
                shippingAddressRequired: true,
                shippingAddressParameters: {
                    phoneNumberRequired: true,
                    allowedCountryCodes: ['AU', 'US', 'JP'],
                },
            });

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getShippingAddress',
            ).mockReturnValueOnce(undefined);

            await processor.initialize(getGeneric);
            await processor.showPaymentSheet();

            expect(paymentsClient.loadPaymentData).toHaveBeenCalledWith(expectedRequest);
        });

        describe('should fail if:', () => {
            test('not initialized', async () => {
                const showPaymentSheet = processor.showPaymentSheet();

                await expect(showPaymentSheet).rejects.toThrow(NotInitializedError);
            });
        });
    });

    describe('#setExternalCheckoutXhr', () => {
        it('should set external checkout', async () => {
            const setExternalCheckout = processor.setExternalCheckoutXhr(
                'example',
                getCardDataResponse(),
            );

            await expect(setExternalCheckout).resolves.toBeUndefined();
        });

        it('should map response to external checkout data', async () => {
            const response = getCardDataResponse();

            await processor.setExternalCheckoutXhr('example', response);

            expect(gateway.mapToExternalCheckoutData).toHaveBeenCalledWith(response);
        });

        it('should send request', async () => {
            const response = getCardDataResponse();

            await processor.setExternalCheckoutXhr('example', response);

            expect(requestSender.post).toHaveBeenCalledWith('/checkout.php', {
                headers: {
                    Accept: 'text/html',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Checkout-SDK-Version': '1.0.0',
                },
                body: {
                    action: 'set_external_checkout',
                    provider: 'example',
                    nonce: '{"signature":"foo","protocolVersion":"ECv1","signedMessage":{"encryptedMessage":"bar","ephemeralPublicKey":"baz","tag":"foobar"}}',
                    card_information: {
                        type: 'VISA',
                        number: '1111',
                    },
                },
            });
        });
    });

    describe('#setExternalCheckoutForm', () => {
        it('should set external checkout', async () => {
            const setExternalCheckout = processor.setExternalCheckoutForm(
                'example',
                getCardDataResponse(),
            );

            await expect(setExternalCheckout).resolves.toBeUndefined();
        });

        it('should map response to external checkout data', async () => {
            const response = getCardDataResponse();

            await processor.setExternalCheckoutForm('example', response);

            expect(gateway.mapToExternalCheckoutData).toHaveBeenCalledWith(response);
        });

        it('should post form', async () => {
            const response = getCardDataResponse();

            await processor.setExternalCheckoutForm('example', response);

            expect(formPoster.postForm).toHaveBeenCalledWith(
                '/checkout.php',
                {
                    action: 'set_external_checkout',
                    provider: 'example',
                    nonce: '{"signature":"foo","protocolVersion":"ECv1","signedMessage":{"encryptedMessage":"bar","ephemeralPublicKey":"baz","tag":"foobar"}}',
                    card_information: JSON.stringify({
                        type: 'VISA',
                        number: '1111',
                    }),
                },
                expect.any(Function),
            );
        });

        it('should post form to siteLike', async () => {
            const response = getCardDataResponse();

            await processor.setExternalCheckoutForm('example', response, 'https://example.com');

            expect(formPoster.postForm).toHaveBeenCalledWith(
                'https://example.com/checkout',
                expect.anything(),
                expect.anything(),
            );
        });
    });

    describe('#mapToBillingAddressRequestBody', () => {
        it('should delegate the work to the gateway', () => {
            const response = getCardDataResponse();

            processor.mapToBillingAddressRequestBody(response);

            expect(gateway.mapToBillingAddressRequestBody).toHaveBeenCalledWith(response);
        });
    });

    describe('#mapToShippingAddressRequestBody', () => {
        it('should delegate the work to the gateway', () => {
            const response = getCardDataResponse();

            processor.mapToShippingAddressRequestBody(response);

            expect(gateway.mapToShippingAddressRequestBody).toHaveBeenCalledWith(response);
        });
    });

    describe('#processAdditionalAction', () => {
        it('should delegate the work to the gateway', async () => {
            const myGateway = new (class
                extends GooglePayGateway
                implements GooglePayAdditionalActionProcessable
            {
                processAdditionalAction() {
                    return Promise.resolve();
                }
            })('example', paymentIntegrationService);

            jest.spyOn(myGateway, 'processAdditionalAction');
            processor = new GooglePayPaymentProcessor(
                scriptLoader,
                myGateway,
                requestSender,
                formPoster,
            );

            const processError = processor.processAdditionalAction('error');

            await expect(processError).resolves.toBeUndefined();
            expect(myGateway.processAdditionalAction).toHaveBeenCalled();
        });

        it('should reject the error', async () => {
            const processError = processor.processAdditionalAction('error');

            await expect(processError).rejects.toBe('error');
        });
    });
});
