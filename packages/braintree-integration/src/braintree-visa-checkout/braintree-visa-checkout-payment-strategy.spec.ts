import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
    BraintreeVisaCheckout,
    getBraintree,
    getDataCollectorMock,
    getPaymentSuccessPayload,
    getVisaCheckoutMock,
    getVisaCheckoutSDKMock,
    VisaCheckoutHostWindow,
    VisaCheckoutPaymentSuccessPayload,
    VisaCheckoutSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeVisaCheckoutPaymentStrategy from './braintree-visa-checkout-payment-strategy';

describe('BraintreeVisaCheckoutPaymentStrategy', () => {
    let strategy: BraintreeVisaCheckoutPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeSdk: BraintreeSdk;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let formPoster: FormPoster;
    let paymentMethodMock: PaymentMethod;
    let braintreeVisaCheckout: BraintreeVisaCheckout;
    let mockWindow: VisaCheckoutHostWindow;
    let visaCheckoutSDKMock: VisaCheckoutSDK;
    let braintreeVisaCheckoutButtonElement: HTMLDivElement;
    let dataCollector: BraintreeDataCollector;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let visaPayload: VisaCheckoutPaymentSuccessPayload;

    const defaultContainerId = 'braintree-visa-checkout-button-mock-id';

    beforeEach(() => {
        visaPayload = getPaymentSuccessPayload();

        mockWindow = {} as VisaCheckoutHostWindow & BraintreeHostWindow;

        dataCollector = getDataCollectorMock();

        visaCheckoutSDKMock = getVisaCheckoutSDKMock();

        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myVisaCheckoutToken',
        };

        braintreeVisaCheckoutButtonElement = document.createElement('div');
        braintreeVisaCheckoutButtonElement.id = defaultContainerId;
        document.body.appendChild(braintreeVisaCheckoutButtonElement);

        braintreeVisaCheckout = getVisaCheckoutMock();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();

        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            mockWindow,
            braintreeSDKVersionManager,
        );
        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

        strategy = new BraintreeVisaCheckoutPaymentStrategy(
            paymentIntegrationService,
            formPoster,
            braintreeSdk,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');

        jest.spyOn(braintreeSdk, 'initialize');
        jest.spyOn(braintreeSdk, 'deinitialize');
        jest.spyOn(braintreeSdk, 'getBraintreeVisaCheckout').mockResolvedValue(
            braintreeVisaCheckout,
        );
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockResolvedValue(dataCollector);

        jest.spyOn(braintreeSdk, 'getVisaCheckoutSdk').mockImplementation(() => {
            mockWindow.V = visaCheckoutSDKMock;

            return Promise.resolve(mockWindow.V);
        });

        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates an instance of BraintreeVisaCheckoutPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeVisaCheckoutPaymentStrategy);
    });

    describe('#initialize()', () => {
        let visaCheckoutOptions: PaymentInitializeOptions;

        beforeEach(() => {
            visaCheckoutOptions = { methodId: 'braintreevisacheckout', braintreevisacheckout: {} };
        });

        it('loads visacheckout in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(visaCheckoutOptions);

            expect(braintreeSdk.getVisaCheckoutSdk).toHaveBeenLastCalledWith(true);
        });

        it('loads visacheckout without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(visaCheckoutOptions);

            expect(braintreeSdk.getVisaCheckoutSdk).toHaveBeenLastCalledWith(false);
        });

        it('registers the error and success callbacks', async () => {
            jest.spyOn(visaCheckoutSDKMock, 'on').mockImplementation((_, callback) => {
                callback(visaPayload, new Error());
            });
            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutSDKMock.on).toHaveBeenCalledWith(
                'payment.success',
                expect.any(Function),
            );
            expect(visaCheckoutSDKMock.on).toHaveBeenCalledWith(
                'payment.error',
                expect.any(Function),
            );
        });

        describe('when payment.success', () => {
            beforeEach(() => {
                jest.spyOn(visaCheckoutSDKMock, 'on').mockImplementation((_, callback) => {
                    callback(visaPayload, new Error());
                });
            });

            it('reloads checkout and payment method', async () => {
                await strategy.initialize(visaCheckoutOptions);

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.loadCheckout).toHaveBeenCalledTimes(1);
                expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledTimes(2);
                expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                    'braintreevisacheckout',
                );
            });

            it('fires onPaymentSelect when there is been a change in payment method', async () => {
                const onPaymentSelect = jest.fn();

                await strategy.initialize({
                    ...visaCheckoutOptions,
                    braintreevisacheckout: {
                        onPaymentSelect,
                    },
                });

                await new Promise((resolve) => process.nextTick(resolve));

                expect(onPaymentSelect).toHaveBeenCalled();
            });
        });

        it('triggers onError from the options when there is a payment error', async () => {
            const onError = jest.fn();
            const errorMock = new Error();

            jest.spyOn(visaCheckoutSDKMock, 'on').mockImplementation((_, callback) => {
                callback(visaPayload, errorMock);
            });

            await strategy.initialize({
                ...visaCheckoutOptions,
                braintreevisacheckout: {
                    onError,
                },
            });

            expect(onError).toHaveBeenCalledWith(errorMock);
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let visaCheckoutOptions: PaymentInitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            paymentMethodMock.initializationData = { nonce: 'payment-nonce-for-visacheckout' };

            visaCheckoutOptions = { methodId: 'braintreevisacheckout', braintreevisacheckout: {} };
        });

        it('calls submit order with the order request information', async () => {
            await strategy.initialize(visaCheckoutOptions);
            await strategy.execute(orderRequestBody, visaCheckoutOptions);

            const { payment, ...order } = orderRequestBody;

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                order,
                expect.any(Object),
            );
        });

        it('pass the options to submitOrder', async () => {
            await strategy.initialize(visaCheckoutOptions);
            await strategy.execute(orderRequestBody, visaCheckoutOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                expect.any(Object),
                visaCheckoutOptions,
            );
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    nonce: 'payment-nonce-for-visacheckout',
                },
            };

            await strategy.initialize(visaCheckoutOptions);
            await strategy.execute(orderRequestBody, visaCheckoutOptions);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('throws if a nonce is not present', async () => {
            paymentMethodMock.initializationData = {};

            await strategy.initialize(visaCheckoutOptions);

            try {
                await strategy.execute(orderRequestBody, visaCheckoutOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#deinitialize()', () => {
        beforeEach(async () => {
            await strategy.initialize({
                methodId: 'braintreevisacheckout',
                braintreevisacheckout: {},
            });
        });

        it('deinitializes BraintreeVisaCheckoutPaymentProcessor', async () => {
            await strategy.deinitialize();

            expect(braintreeSdk.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
