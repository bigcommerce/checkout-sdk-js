import {
    AmazonPayV2NewButtonParams,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
    getAmazonPayV2,
    getAmazonPayV2PaymentProcessorMock,
    getAmazonPayV2Ph4ButtonParamsMock,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AmazonPayV2PaymentInitializeOptions, {
    WithAmazonPayV2PaymentInitializeOptions,
} from './amazon-pay-v2-payment-initialize-options';
import AmazonPayV2PaymentStrategy from './amazon-pay-v2-payment-strategy';

describe('AmazonPayV2PaymentStrategy', () => {
    let amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor;
    let editMethodButton: HTMLDivElement;
    let amazonPayButton: HTMLDivElement;
    let paymentMethodMock: PaymentMethod;
    let strategy: AmazonPayV2PaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let storeConfigMock: StoreConfig;

    beforeEach(() => {
        amazonPayV2PaymentProcessor =
            getAmazonPayV2PaymentProcessorMock() as unknown as AmazonPayV2PaymentProcessor;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paymentMethodMock = getAmazonPayV2();
        storeConfigMock = getConfig().storeConfig;
        paymentIntegrationService.widgetInteraction = jest.fn();
        storeConfigMock.checkoutSettings.features = {
            'PROJECT-3483.amazon_pay_ph4': false,
            'INT-6399.amazon_pay_apb': false,
        };

        editMethodButton = document.createElement('div');
        editMethodButton.setAttribute('id', 'editButtonId');
        document.body.appendChild(editMethodButton);

        amazonPayButton = document.createElement('div');

        jest.spyOn(amazonPayButton, 'click');

        jest.spyOn(amazonPayV2PaymentProcessor, 'renderAmazonPayButton').mockReturnValue(
            amazonPayButton,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfigMock,
        );

        strategy = new AmazonPayV2PaymentStrategy(
            paymentIntegrationService,
            amazonPayV2PaymentProcessor,
        );
    });

    afterEach(() => {
        if (editMethodButton.parentElement === document.body) {
            document.body.removeChild(editMethodButton);
        } else {
            const shippingButton = document.getElementById('editButtonId');

            if (shippingButton) {
                document.body.removeChild(shippingButton);
            }
        }
    });

    describe('#initialize', () => {
        let amazonpayv2InitializeOptions: AmazonPayV2PaymentInitializeOptions;
        let initializeOptions: PaymentInitializeOptions & WithAmazonPayV2PaymentInitializeOptions;
        const paymentToken = 'abc123';
        const changeMethodId = 'editButtonId';

        beforeEach(() => {
            amazonpayv2InitializeOptions = { editButtonId: changeMethodId };
            initializeOptions = { methodId: 'amazonpay', amazonpay: amazonpayv2InitializeOptions };
        });

        it('should initialize the processor', async () => {
            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
        });

        it('should bind edit method button if paymentToken and editButtonId are present', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).toHaveBeenCalledWith(
                changeMethodId,
                paymentToken,
                'changePayment',
            );
        });

        it('should not bind edit method button if paymentToken is not present', async () => {
            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
        });

        it('should not bind edit method button if paymentToken is present but editButtonId is not', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            if (initializeOptions.amazonpay) {
                delete initializeOptions.amazonpay.editButtonId;
            }

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
        });

        it('creates a signin button if paymentToken is not present on initializationData', async () => {
            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.renderAmazonPayButton).toHaveBeenCalledWith({
                checkoutState: paymentIntegrationService.getState(),
                containerId: 'AmazonPayButton',
                decoupleCheckoutInitiation: false,
                methodId: 'amazonpay',
                placement: AmazonPayV2Placement.Checkout,
            });
        });

        it('creates an additional payment button for one-time transactions', async () => {
            storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3483.amazon_pay_ph4': true,
                'INT-6399.amazon_pay_apb': true,
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.renderAmazonPayButton).toHaveBeenCalledWith({
                checkoutState: paymentIntegrationService.getState(),
                containerId: 'AmazonPayButton',
                decoupleCheckoutInitiation: true,
                methodId: 'amazonpay',
                placement: AmazonPayV2Placement.Checkout,
            });
        });

        it('dispatches widgetInteraction when clicking previously binded edit method button if region not US', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            paymentMethodMock.initializationData.region = 'uk';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            const editButton = document.getElementById(changeMethodId);

            if (editButton) {
                editButton.click();
            }

            expect(paymentIntegrationService.widgetInteraction).toHaveBeenCalled();
        });

        it('avoid dispatching widgetInteraction when clicking previously binded edit method button if region US', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            paymentMethodMock.initializationData.region = 'us';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            const editButton = document.getElementById(changeMethodId);

            if (editButton) {
                editButton.click();
            }

            expect(paymentIntegrationService.widgetInteraction).not.toHaveBeenCalled();
        });

        it('does not bind edit method button if button do not exist', async () => {
            document.body.removeChild(editMethodButton);
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.renderAmazonPayButton).not.toHaveBeenCalled();

            document.body.appendChild(editMethodButton);
        });

        describe('should fail if...', () => {
            test('methodId is not provided', async () => {
                initializeOptions.methodId = '';

                await expect(strategy.initialize(initializeOptions)).rejects.toThrow(
                    InvalidArgumentError,
                );

                expect(amazonPayV2PaymentProcessor.initialize).not.toHaveBeenCalled();
            });

            test("payment button wasn't rendered is not provided", async () => {
                jest.spyOn(amazonPayV2PaymentProcessor, 'renderAmazonPayButton').mockReturnValue(
                    undefined,
                );

                await expect(strategy.initialize(initializeOptions)).rejects.toThrow(
                    'Unable to render the Amazon Pay button to an invalid HTML container element.',
                );
            });
        });
    });

    describe('#execute', () => {
        let amazonpayv2InitializeOptions: AmazonPayV2PaymentInitializeOptions;
        let initializeOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;
        const paymentToken = 'abc123';

        beforeEach(async () => {
            amazonpayv2InitializeOptions = { editButtonId: 'editButtonId' };
            initializeOptions = { methodId: 'amazonpay', amazonpay: amazonpayv2InitializeOptions };
            orderRequestBody = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'amazonpay',
                },
            };

            await strategy.initialize(initializeOptions);
        });

        it('executes the strategy successfully if paymentToken is found on intializationData', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            await strategy.execute(orderRequestBody, initializeOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                orderRequestBody,
                initializeOptions,
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'amazonpay',
                paymentData: { nonce: 'abc123' },
            });
        });

        it('executes the strategy successfully if it is a one-time transaction', async () => {
            storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3483.amazon_pay_ph4': true,
                'INT-6399.amazon_pay_apb': true,
            };
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigMock);

            await strategy.execute(orderRequestBody, initializeOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                orderRequestBody,
                initializeOptions,
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'amazonpay',
                paymentData: { nonce: 'apb' },
            });
        });

        it('redirects to Amazon url', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            const paymentFailedErrorAction = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    status: 'additional_action_required',
                    additional_action_required: {
                        data: {
                            redirect_url: 'http://some-url',
                        },
                    },
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(
                paymentFailedErrorAction,
            );

            Object.defineProperty(window, 'location', {
                value: {
                    assign: jest.fn(),
                },
            });

            void strategy.execute(orderRequestBody, initializeOptions);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.assign).toHaveBeenCalledWith('http://some-url');
            expect(amazonPayButton.click).not.toHaveBeenCalled();

            jest.clearAllMocks();
        });

        it('should invoke Amazon Pay Pre-Order page', async () => {
            storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3483.amazon_pay_ph4': true,
                'INT-6399.amazon_pay_apb': true,
            };
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigMock);

            const { publicKeyId, createCheckoutSessionConfig } =
                getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;
            const expectedConfig = {
                publicKeyId,
                ...createCheckoutSessionConfig,
            };
            const paymentFailedErrorAction = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    status: 'additional_action_required',
                    additional_action_required: {
                        data: {
                            redirect_url: JSON.stringify(expectedConfig),
                        },
                    },
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(
                paymentFailedErrorAction,
            );

            void strategy.execute(orderRequestBody, initializeOptions);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(amazonPayV2PaymentProcessor.prepareCheckout).toHaveBeenNthCalledWith(
                1,
                expectedConfig,
            );
            expect(amazonPayButton.click).toHaveBeenCalled();
        });

        describe('should fail if...', () => {
            test('payment argument is invalid', async () => {
                orderRequestBody.payment = undefined;

                await expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(
                    PaymentArgumentInvalidError,
                );
            });

            test('payment method is not found', async () => {
                orderRequestBody.payment = { methodId: '' };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockImplementation(() => {
                    throw new PaymentArgumentInvalidError();
                });

                await expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(
                    PaymentArgumentInvalidError,
                );
            });

            test('buttonContainer has not yet been initialized', async () => {
                await strategy.deinitialize();

                await expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(
                    NotInitializedError,
                );
            });

            test('submitPayment throws an error different than additional_action_required', async () => {
                paymentMethodMock.initializationData.paymentToken = paymentToken;
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethodMock);

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(
                    new RequestError(getResponse(getErrorPaymentResponseBody())),
                );

                Object.defineProperty(window, 'location', {
                    value: {
                        assign: jest.fn(),
                    },
                });

                await expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(
                    RequestError,
                );

                expect(window.location.assign).not.toHaveBeenCalled();
                expect(amazonPayV2PaymentProcessor.prepareCheckout).not.toHaveBeenCalled();
            });
        });
    });

    describe('#finalize', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            await expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        let amazonpayv2InitializeOptions: AmazonPayV2PaymentInitializeOptions;
        let initializeOptions: PaymentInitializeOptions;

        beforeEach(async () => {
            amazonpayv2InitializeOptions = { editButtonId: 'editButtonId' };
            initializeOptions = { methodId: 'amazonpay', amazonpay: amazonpayv2InitializeOptions };
            await strategy.initialize(initializeOptions);
        });

        it('should deinitialize the processor', async () => {
            await strategy.deinitialize();

            expect(amazonPayV2PaymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });
});
