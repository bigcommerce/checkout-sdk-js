import {
    BillingAddress,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { PayPalCommerceHostWindow, PayPalSDK } from '../paypal-commerce-types';
import PaypalCommerceRatepayPaymentStrategy from './paypal-commerce-ratepay-payment-strategy';
import { getPayPalCommerceIntegrationServiceMock, getPayPalSDKMock } from '../mocks';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { PaypalCommerceRatePay } from './paypal-commerce-alternative-methods-payment-initialize-options';
import getPayPalCommerceRatePayPaymentMethod from '../mocks/get-paypal-commerce-ratepay-payment-method.mock';

describe('PayPalCommerceAlternativeMethodRatePayPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: PaypalCommerceRatepayPaymentStrategy;

    const paypalCommerceRatePayMethodsOptions: PaypalCommerceRatePay = {
        container: '#checkout-payment-continue',
        legalTextContainer: 'legal-text-container',
        getFieldsValues: () => {
            return {
                ratepayBirthDate: {
                    getDate: () => 1,
                    getMonth: () => 1,
                    getFullYear: () => 2000,
                },
                ratepayPhoneNumber: '234343434',
                ratepayPhoneCountryCode: '49',
            };
        },
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: 'ratepay',
        gatewayId: 'paypalcommercealternativemethods',
        paypalcommerceratepay: paypalCommerceRatePayMethodsOptions,
    };

    beforeEach(() => {
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new PaypalCommerceRatepayPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
        );

        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'legal-text-container') {
                return {
                    innerHTML: 'Mocked legal text',
                };
            }

            return null;
        });

        paypalSdk = getPayPalSDKMock();
        paypalSdk.Legal.FUNDING = {
            PAY_UPON_INVOICE: 'PAY_UPON_INVOICE',
        };

        paymentMethod = getPayPalCommerceRatePayPaymentMethod();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockReturnValue('1eddfd');
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockReturnValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalCommerceHostWindow).paypal;
    });

    it('creates an instance of the PayPal Commerce RatePay payment strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceRatepayPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if gatewayId is not provided', async () => {
            const options = {
                methodId: 'ratepay',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if options.paypalcommerceratepay is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if container is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    legalTextContainer: 'legal-text-container',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if legalTextContainer is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if merchantId is not provided', async () => {
            paymentMethod.initializationData.merchantId = '';
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                    legalTextContainer: 'legal-text-container',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });

    describe('#createFraudnetScript', () => {
        it('add fraudNet script to document', async () => {
            await strategy.initialize(initializationOptions);

            const fraudNetScript = document.querySelectorAll(
                '[fncls = "fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99"]',
            );

            expect(fraudNetScript).toBeDefined();
        });

        it('add another needed fraudNet script', async () => {
            await strategy.initialize(initializationOptions);
            const script = document.querySelector('script[src="https://c.paypal.com/da/r/fb.js"]');

            expect(script).toBeDefined();
        });
    });

    describe('#renderLegalText', () => {
        it('throws error if legalTextContainerElement is not found', async () => {
            jest.spyOn(document, 'getElementById').mockImplementation(() => null);
            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('renders legal text', async () => {
            await strategy.initialize(initializationOptions);
            const source = document.getElementsByTagName('html')[0].innerHTML;
            const legalText = source.search(
                'By clicking on the button, you agree to the terms of payment and performance of a risk check from the payment partner, Ratepay. You also agree to PayPal’s privacy statement. If your request to purchase upon invoice is accepted, the purchase price claim will be assigned to Ratepay, and you may only pay Ratepay, not the merchant.',
            );

            expect(legalText).toBeDefined();
        });
    });

    describe('#execute()', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if orderId is not defined', async () => {
            jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockReturnValue(undefined);
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('submits order', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('submits payment with correct data', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            const expectedPayload = {
                methodId: 'ratepay',
                paymentData: {
                    formattedPayload: {
                        device_info: null,
                        method_id: 'ratepay',
                        paypal_account: {
                            order_id: '1eddfd',
                        },
                        rate_pay: {
                            birth_date: '2000-02-01',
                            phone: {
                                country_code: '49',
                                national_number: '234343434',
                            },
                        },
                        set_as_default_stored_instrument: null,
                        vault_payment_instrument: null,
                    },
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayload);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
