import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentProcessor, AmazonPayV2Placement } from '../../../payment/strategies/amazon-pay-v2';
import { getAmazonPayV2ButtonParamsMock } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import { getAmazonPayV2CheckoutButtonOptions, Mode } from './amazon-pay-v2-button.mock';

describe('AmazonPayV2ButtonStrategy', () => {
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentProcessor: AmazonPayV2PaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonPayV2ButtonStrategy;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        strategy = new AmazonPayV2ButtonStrategy(
            store,
            checkoutActionCreator,
            paymentProcessor
        );

        checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockResolvedValue(store.getState());

        const buttonContainer = document.createElement('div');
        buttonContainer.setAttribute('id', 'amazonpayCheckoutButton');
        document.body.appendChild(buttonContainer);

        jest.spyOn(paymentProcessor, 'createButton')
            .mockReturnValue(document.createElement('button'));
    });

    afterEach(() => {
        const buttonContainer = document.getElementById('amazonpayCheckoutButton');

        if (buttonContainer) {
            document.body.removeChild(buttonContainer);
        }
    });

    describe('#initialize()', () => {
        it('initialises the payment processor once', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('loads the checkout if AmazonPayV2ButtonInitializeOptions is not provided', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalledTimes(1);
        });

        it('does not load the checkout if AmazonPayV2ButtonInitializeOptions is provided', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('creates the button', async () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock();
            expectedOptions.createCheckoutSession.url = `${getConfig().storeConfig.storeProfile.shopPath}/remote-checkout/amazonpay/payment-session`;
            expectedOptions.placement = AmazonPayV2Placement.Cart;

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                '#amazonpayCheckoutButton',
                expectedOptions
            );
        });

        describe('should fail...', () => {
            test('if methodId is not provided', async () => {
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedMethodId);

                await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
            });

            test('if containerId is not provided', async () => {
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedContainer);

                await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
            });

            test('if there is no payment method data', async () => {
                const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
                const state = { ...getCheckoutStoreState(), paymentMethods };
                store = createCheckoutStore(state);
                strategy = new AmazonPayV2ButtonStrategy(
                    store,
                    checkoutActionCreator,
                    paymentProcessor
                );

                await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
            });
        });

    });

    describe('#deinitialize()', () => {
        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(checkoutButtonOptions);
            await strategy.deinitialize();

            const buttonContainer = document.getElementById(checkoutButtonOptions.containerId);

            expect(buttonContainer).toBeNull();
        });
    });
});
