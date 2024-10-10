import {
    AmazonPayV2ButtonColor,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
    getAmazonPayV2,
    getAmazonPayV2PaymentProcessorMock,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CartSource,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import AmazonPayV2RequestSender from './amazon-pay-v2-request-sender';
import AmazonPayV2ConfigCreationError from './errors/amazon-pay-v2-config-creation-error';
import { getAmazonPayV2CheckoutButtonOptions, Mode } from './mock/amazon-pay-v2-button.mock';
import { getAmazonPayV2RequestSenderMock } from './mock/amazon-pay-v2-config-request-sender.mock';

describe('AmazonPayV2ButtonStrategy', () => {
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: AmazonPayV2ButtonStrategy;
    let amazonPayV2RequestSender: AmazonPayV2RequestSender;

    beforeEach(() => {
        const cart = getCart();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        amazonPayV2PaymentProcessor =
            getAmazonPayV2PaymentProcessorMock() as unknown as AmazonPayV2PaymentProcessor;
        amazonPayV2RequestSender =
            getAmazonPayV2RequestSenderMock() as unknown as AmazonPayV2RequestSender;
        checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

        const buyNowCartMock = {
            ...cart,
            id: '999',
            source: CartSource.BuyNow,
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getAmazonPayV2(),
        );
        jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
            Promise.resolve(buyNowCartMock),
        );
        jest.spyOn(
            amazonPayV2PaymentProcessor,
            'prepareCheckoutWithCreationRequestConfig',
        ).mockImplementation(jest.fn());

        strategy = new AmazonPayV2ButtonStrategy(
            paymentIntegrationService,
            amazonPayV2PaymentProcessor,
            amazonPayV2RequestSender,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('should initialize the processor', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
        });

        it('should initialize with Buy Now Flow', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.BuyNowFlow);
            await strategy.initialize(checkoutButtonOptions);

            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
            expect(paymentIntegrationService.loadDefaultCheckout).not.toHaveBeenCalled();
            expect(
                amazonPayV2PaymentProcessor.prepareCheckoutWithCreationRequestConfig,
            ).toHaveBeenCalled();
        });

        it('loads the checkout if AmazonPayV2ButtonInitializeOptions is not provided', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('does not load the checkout if AmazonPayV2ButtonInitializeOptions is provided', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('should render the button', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(amazonPayV2PaymentProcessor.renderAmazonPayButton).toHaveBeenCalledWith({
                buttonColor: AmazonPayV2ButtonColor.Gold,
                checkoutState: paymentIntegrationService.getState(),
                containerId: 'amazonpayCheckoutButton',
                methodId: 'amazonpay',
                options: checkoutButtonOptions.amazonpay,
                placement: AmazonPayV2Placement.Cart,
            });
        });

        describe('should fail...', () => {
            test('if methodId is not provided', async () => {
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedMethodId);

                const initialize = strategy.initialize(checkoutButtonOptions);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('if containerId is not provided', async () => {
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(
                    Mode.UndefinedContainer,
                );

                const initialize = strategy.initialize(checkoutButtonOptions);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('if there is no payment method data', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockImplementation(() => {
                    throw new PaymentArgumentInvalidError();
                });

                const initialize = strategy.initialize(checkoutButtonOptions);

                await expect(initialize).rejects.toThrow(PaymentArgumentInvalidError);
            });

            it('if initialize with Buy Now Flow but createBuyNowCart throw error', async () => {
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.BuyNowFlow);

                jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockRejectedValue(
                    undefined,
                );

                await strategy.initialize(checkoutButtonOptions);

                expect(amazonPayV2RequestSender.createCheckoutConfig).not.toHaveBeenCalled();
            });

            it('if initialize with Buy Now Flow but createCheckoutConfig throw error', async () => {
                let callbackResult;

                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.BuyNowFlow);

                jest.spyOn(
                    amazonPayV2PaymentProcessor,
                    'prepareCheckoutWithCreationRequestConfig',
                ).mockImplementation((callback: () => Promise<unknown>) => {
                    callbackResult = callback();
                });
                jest.spyOn(amazonPayV2RequestSender, 'createCheckoutConfig').mockRejectedValue(
                    undefined,
                );

                try {
                    await strategy.initialize(checkoutButtonOptions);
                    await new Promise((resolve) => process.nextTick(resolve));
                } catch (err: unknown) {
                    callbackResult = err;
                } finally {
                    await expect(callbackResult).rejects.toThrow(AmazonPayV2ConfigCreationError);
                }
            });
        });
    });

    describe('#deinitialize', () => {
        it('succesfully deinitializes the strategy', async () => {
            await strategy.deinitialize();

            expect(amazonPayV2PaymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });
});
