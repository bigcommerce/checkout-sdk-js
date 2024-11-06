import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderRequestBody,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayGateway from '../gateways/google-pay-gateway';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../google-pay-payment-strategy';
import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getGeneric, getStripe } from '../mocks/google-pay-payment-method.mock';

import GooglePayStripeGateway from './google-pay-stripe-gateway';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import { getStripeUPEJsMock } from './stripe.mock';

describe('GooglePayStripeGateway', () => {
    let gateway: GooglePayStripeGateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: StripeUPEScriptLoader;
    let strategy: GooglePayPaymentStrategy;
    let processor: GooglePayPaymentProcessor;
    let formPoster: FormPoster;
    let payload: OrderRequestBody;
    const storeConfig = getConfig().storeConfig;

    beforeEach(() => {
        formPoster = {
            postForm: jest.fn(),
        } as unknown as FormPoster;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = new StripeUPEScriptLoader(getScriptLoader());
        gateway = new GooglePayStripeGateway(paymentIntegrationService, scriptLoader);
        processor = new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            gateway,
            createRequestSender(),
            formPoster,
        );
        strategy = new GooglePayPaymentStrategy(paymentIntegrationService, processor);

        payload = {
            payment: {
                methodId: 'stripe',
            },
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getStripe(),
        );
        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'getNonce').mockResolvedValue('nonceValue');
        jest.spyOn(scriptLoader, 'getStripeClient').mockResolvedValue(getStripeUPEJsMock());
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
            ...storeConfig,
            checkoutSettings: {
                ...storeConfig.checkoutSettings,
                features: {
                    'STRIPE-476.enable_stripe_googlepay_3ds': true,
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('is a special type of GooglePayGateway', () => {
        expect(gateway).toBeInstanceOf(GooglePayGateway);
    });

    describe('3DS', () => {
        it('execute 3DS challenge successfully', async () => {
            await gateway.initialize(getStripe);

            const confirmCardPayment = jest.fn().mockReturnValue({
                paymentIntent: 'paymentIntent',
            });

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce({
                body: {
                    errors: [
                        {
                            code: 'three_d_secure_required',
                        },
                    ],
                    three_ds_result: {
                        token: 'token_3ds',
                    },
                },
            });
            jest.spyOn(scriptLoader, 'getStripeClient').mockResolvedValue({
                ...getStripeUPEJsMock(),
                confirmCardPayment,
            });

            await strategy.execute(payload);

            expect(confirmCardPayment).toHaveBeenCalledWith('token_3ds');
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
        });

        it('doesn"t execute 3DS challenge if experiment is off', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        'STRIPE-476.enable_stripe_googlepay_3ds': false,
                    },
                },
            });

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce({
                body: {
                    errors: [
                        {
                            code: 'three_d_secure_required',
                        },
                    ],
                    three_ds_result: {
                        token: 'token_3ds',
                    },
                },
            });
            await gateway.initialize(getStripe);

            const confirmCardPayment = jest.fn().mockReturnValue({
                paymentIntent: 'paymentIntent',
            });

            jest.spyOn(scriptLoader, 'getStripeClient').mockResolvedValue({
                ...getStripeUPEJsMock(),
                confirmCardPayment,
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(confirmCardPayment).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            }
        });

        it('should process additional action', async () => {
            jest.spyOn(processor, 'processAdditionalAction').mockResolvedValue(undefined);

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue('error');

            await strategy.execute(payload);

            expect(processor.processAdditionalAction).toHaveBeenCalledWith('error', 'stripe');
        });

        it('execute failed 3DS challenge', async () => {
            await gateway.initialize(getStripe);

            const confirmCardPayment = jest.fn().mockReturnValue({
                error: {
                    type: 'validation_error',
                    message: 'Some Stripe error message',
                },
            });

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce({
                body: {
                    errors: [
                        {
                            code: 'three_d_secure_required',
                        },
                    ],
                    three_ds_result: {
                        token: 'token_3ds',
                    },
                },
            });
            jest.spyOn(scriptLoader, 'getStripeClient').mockResolvedValue({
                ...getStripeUPEJsMock(),
                confirmCardPayment,
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toBe('Some Stripe error message');
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                }
            }
        });

        it('returns error object if it"s not a request error', async () => {
            await gateway.initialize(getStripe);

            const otherError = {
                body: {
                    errors: [
                        {
                            code: 'some other error',
                        },
                    ],
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(otherError);

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBe(otherError);
            }
        });
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const response = getCardDataResponse();

            response.paymentMethodData.tokenizationData.token = '{"id":"tok_f00b4r"}';

            const expectedData = {
                nonce: 'tok_f00b4r',
                card_information: {
                    type: 'VISA',
                    number: '1111',
                },
            };

            const mappedData = await gateway.mapToExternalCheckoutData(response);

            expect(mappedData).toStrictEqual(expectedData);
        });

        describe('should fail if:', () => {
            test('nonce is not valid JSON', async () => {
                const response = getCardDataResponse();

                response.paymentMethodData.tokenizationData.token = 'm4lf0rm3d j50n';

                const mapData = gateway.mapToExternalCheckoutData(response);

                await expect(mapData).rejects.toThrow(InvalidArgumentError);
            });

            test('parsed nonce is not a GooglePayStripeTokenObject', async () => {
                const mapData = gateway.mapToExternalCheckoutData(getCardDataResponse());

                await expect(mapData).rejects.toThrow(MissingDataError);
            });
        });
    });

    describe('#getPaymentGatewayParameters', () => {
        it('should return payment gateway parameters', async () => {
            const expectedParams = {
                gateway: 'stripe',
                'stripe:version': '2026-02-31',
                'stripe:publishableKey': 'pk_live_f00b4r/acct_f00b4r',
            };

            await gateway.initialize(getStripe);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        describe('should fail if:', () => {
            test('not initialized', () => {
                expect(() => gateway.getPaymentGatewayParameters()).toThrow(NotInitializedError);
            });

            test('initializationData is not GooglePayStripeInitializationData', async () => {
                await gateway.initialize(getGeneric);

                expect(() => gateway.getPaymentGatewayParameters()).toThrow(MissingDataError);
            });
        });
    });
});
