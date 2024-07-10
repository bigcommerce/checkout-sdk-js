import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    AmazonPayV2ButtonColor,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
    createAmazonPayV2PaymentProcessor,
    getAmazonPayV2,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';

import { CartRequestSender } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { AmazonPayV2RequestSender } from '../../../checkout-buttons/strategies/amazon-pay-v2';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import { getAmazonPayV2CheckoutButtonOptions, Mode } from './amazon-pay-v2-button.mock';
import { getCheckoutRequestConfig } from './amazon-pay-v2-config-request-sender-mock';

describe('AmazonPayV2ButtonStrategy', () => {
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentProcessor: AmazonPayV2PaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonPayV2ButtonStrategy;
    let cartRequestSender: CartRequestSender;
    let amazonPayV2RequestSender: AmazonPayV2RequestSender;

    const cart = getCart();

    const buyNowCartMock = {
        ...cart,
        id: 999,
        source: 'BUY_NOW',
    };

    beforeEach(() => {
        checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();

        cartRequestSender = new CartRequestSender(requestSender);

        amazonPayV2RequestSender = new AmazonPayV2RequestSender(requestSender);

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout').mockResolvedValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            store.getState(),
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        jest.spyOn(paymentProcessor, 'initialize').mockResolvedValue(undefined);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentProcessor, 'renderAmazonPayButton').mockResolvedValue('foo');

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(amazonPayV2RequestSender, 'createCheckoutConfig').mockResolvedValue({
            body: getCheckoutRequestConfig(),
        });

        jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue({
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            body: buyNowCartMock,
        });

        jest.spyOn(paymentProcessor, 'prepareCheckoutWithCreationRequestConfig').mockReturnValue(
            undefined,
        );

        jest.spyOn(paymentProcessor, 'deinitialize').mockResolvedValue(undefined);

        strategy = new AmazonPayV2ButtonStrategy(
            store,
            checkoutActionCreator,
            paymentProcessor,
            cartRequestSender,
            amazonPayV2RequestSender,
        );
    });

    describe('#initialize', () => {
        it('should initialize the processor', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
        });

        it('should initialize with Buy Now Flow', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.BuyNowFlow);
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
            expect(checkoutActionCreator.loadDefaultCheckout).not.toHaveBeenCalled();
            expect(paymentProcessor.prepareCheckoutWithCreationRequestConfig).toHaveBeenCalled();
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
                buttonColor: AmazonPayV2ButtonColor.Gold,
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
                checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(
                    Mode.UndefinedContainer,
                );

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
                    paymentProcessor,
                    cartRequestSender,
                    amazonPayV2RequestSender,
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
