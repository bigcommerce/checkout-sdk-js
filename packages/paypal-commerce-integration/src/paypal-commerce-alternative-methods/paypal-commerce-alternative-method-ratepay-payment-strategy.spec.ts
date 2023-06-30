import {
    BillingAddress,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentInitializeOptions,
    InvalidArgumentError, PaymentArgumentInvalidError, PaymentMethodInvalidError, OrderFinalizationNotRequiredError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { EventEmitter } from "events";
import { LoadingIndicator } from "@bigcommerce/checkout-sdk/ui";
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { PayPalCommerceHostWindow, PayPalSDK } from "../paypal-commerce-types";
import PayPalCommerceAlternativeMethodRatePayPaymentStrategy from './paypal-commerce-alternative-method-ratepay-payment-strategy';
import { getPayPalCommerceIntegrationServiceMock } from "../mocks";
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { PaypalCommerceRatePay } from './paypal-commerce-alternative-methods-payment-initialize-options';
import getPayPalCommerceRatePayPaymentMethod from '../mocks/get-paypal-commerce-ratepay-payment-method.mock';

describe('PayPalCommerceAlternativeMethodRatePayPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: PayPalCommerceAlternativeMethodRatePayPaymentStrategy;

    const paypalCommerceRatePayMethodsOptions: PaypalCommerceRatePay =
        {
            container: '#ratepay-container',
            legalTextContainer: '#legal-text-container',
            getFieldsValues:() =>  {
               return {
                   ratepay_birth_date: {
                       getDate: () => 1,
                       getMonth: () => 1,
                       getFullYear: () => 2000,
                   },
                   ratepay_phone_number: '234343434',
                   ratepay_phone_country_code: '49',
               }
            }
        };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: 'ratepay',
        gatewayId: 'paypalcommercealternativemethods',
        paypalcommerceratepay: paypalCommerceRatePayMethodsOptions,
    };

    beforeEach(() => {
        loadingIndicator = new LoadingIndicator();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();

        strategy = new PayPalCommerceAlternativeMethodRatePayPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
            loadingIndicator,
        );

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
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockReturnValue(undefined);
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockReturnValue(undefined);
        jest.spyOn(paypalSdk, 'Legal').mockImplementation((options: any) => {
            eventEmitter.on('render', () => {
                if (options.render) {
                    options.render();
                }
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalCommerceHostWindow).paypal;
    });

    it('creates an instance of the PayPal Commerce RatePay payment strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceAlternativeMethodRatePayPaymentStrategy);
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

        it('does not continues strategy initialization if order id is available in initializationData', async () => {
            paymentMethod.initializationData.orderId = '1';

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).not.toHaveBeenCalled();
        });
    });

    describe('#renderLegalText', () => { // TODO: FIX
        it('render legal text', () => {

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
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
            }
        });

        it('submits payment with provided data', async () => {
            paymentMethod.initializationData.orderId = '';
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(paypalCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                'paypalrate123',
            );
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
