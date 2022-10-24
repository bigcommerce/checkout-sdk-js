import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getAmazonPayV2, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { AmazonPayV2PaymentProcessor, AmazonPayV2Placement, createAmazonPayV2PaymentProcessor } from '../../../payment/strategies/amazon-pay-v2';
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
        checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockResolvedValue(store.getState());

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        jest.spyOn(paymentProcessor, 'initialize')
            .mockResolvedValue(undefined);

        jest.spyOn(paymentProcessor, 'renderAmazonPayButton')
            .mockResolvedValue('foo');

        jest.spyOn(paymentProcessor, 'deinitialize')
            .mockResolvedValue(undefined);

        strategy = new AmazonPayV2ButtonStrategy(
            store,
            checkoutActionCreator,
            paymentProcessor
        );
    });

    describe('#initialize', () => {
        it('should initialize the processor', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
        });

        it('loads the checkout if AmazonPayV2ButtonInitializeOptions is not provided', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await strategy.initialize(checkoutButtonOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('does not load the checkout if AmazonPayV2ButtonInitializeOptions is provided', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('should render the button', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.renderAmazonPayButton).toHaveBeenCalledWith({
                checkoutState: store.getState(),
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
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedContainer);

                const initialize = strategy.initialize(checkoutButtonOptions);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
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

                const initialize = strategy.initialize(checkoutButtonOptions);

                await expect(initialize).rejects.toThrow(MissingDataError);
            });
        });
    });

    describe('#deinitialize', () => {
        it('succesfully deinitializes the strategy', async () => {
            await strategy.deinitialize();

            expect(paymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });
});
