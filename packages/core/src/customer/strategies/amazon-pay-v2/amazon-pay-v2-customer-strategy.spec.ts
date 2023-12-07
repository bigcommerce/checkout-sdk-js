import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { of } from 'rxjs';

import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    NotImplementedError,
} from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getAmazonPayV2, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import {
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
    createAmazonPayV2PaymentProcessor,
} from '../../../payment/strategies/amazon-pay-v2';
import {
    RemoteCheckoutActionCreator,
    RemoteCheckoutActionType,
    RemoteCheckoutRequestSender,
} from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';

import AmazonPayV2CustomerStrategy from './amazon-pay-v2-customer-strategy';
import { getAmazonPayV2CustomerInitializeOptions, Mode } from './amazon-pay-v2-customer.mock';

describe('AmazonPayV2CustomerStrategy', () => {
    let checkoutActionCreator: CheckoutActionCreator;
    let customerInitializeOptions: CustomerInitializeOptions;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentProcessor: AmazonPayV2PaymentProcessor;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonPayV2CustomerStrategy;

    beforeEach(() => {
        customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            store.getState(),
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator,
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        jest.spyOn(paymentProcessor, 'initialize').mockResolvedValue(undefined);

        jest.spyOn(paymentProcessor, 'signout').mockResolvedValue(undefined);

        jest.spyOn(paymentProcessor, 'renderAmazonPayButton').mockResolvedValue('foo');

        jest.spyOn(paymentProcessor, 'deinitialize').mockResolvedValue(undefined);

        strategy = new AmazonPayV2CustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            paymentProcessor,
        );
    });

    describe('#initialize', () => {
        it('should initialize the processor', async () => {
            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
        });

        it('should render the button', async () => {
            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.renderAmazonPayButton).toHaveBeenCalledWith({
                checkoutState: store.getState(),
                containerId: 'amazonpayCheckoutButton',
                methodId: 'amazonpay',
                placement: AmazonPayV2Placement.Checkout,
                onClick: customerInitializeOptions.amazonpay?.onClick,
            });
        });

        describe('should fail...', () => {
            test('if methodId is not provided', async () => {
                customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(
                    Mode.UndefinedMethodId,
                );

                const initialize = strategy.initialize(customerInitializeOptions);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('if containerId is not provided', async () => {
                customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(
                    Mode.Incomplete,
                );

                const initialize = strategy.initialize(customerInitializeOptions);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('if onClick is not a function', async () => {
                customerInitializeOptions = {
                    ...getAmazonPayV2CustomerInitializeOptions(Mode.UndefinedMethodId),
                    onClick: 'test',
                };

                const initialize = strategy.initialize(customerInitializeOptions);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('if there is no payment method data', async () => {
                const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
                const state = { ...getCheckoutStoreState(), paymentMethods };

                store = createCheckoutStore(state);
                strategy = new AmazonPayV2CustomerStrategy(
                    store,
                    paymentMethodActionCreator,
                    remoteCheckoutActionCreator,
                    paymentProcessor,
                );

                const initialize = strategy.initialize(customerInitializeOptions);

                await expect(initialize).rejects.toThrow(MissingDataError);
            });
        });
    });

    describe('#deinitialize', () => {
        it('succesfully deinitializes the strategy', async () => {
            await paymentProcessor.deinitialize();

            expect(paymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#signIn', () => {
        it('throws error if trying to sign in programmatically', async () => {
            await strategy.initialize(customerInitializeOptions);

            expect(strategy.signIn).toThrow(NotImplementedError);
        });
    });

    describe('#signOut', () => {
        beforeEach(async () => {
            await strategy.initialize(customerInitializeOptions);
        });

        it('signs out from Amazon and remote checkout provider', async () => {
            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValueOnce({
                providerId: 'amazonpay',
            });
            jest.spyOn(remoteCheckoutActionCreator, 'signOut').mockReturnValue(
                of(createAction(RemoteCheckoutActionType.ForgetCheckoutRemoteCustomerSucceeded)),
            );

            await strategy.signOut({
                methodId: 'amazonpay',
            });

            expect(paymentProcessor.signout).toHaveBeenCalledTimes(1);
            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledTimes(1);
        });

        it('does nothing if already signed out from remote checkout provider', async () => {
            jest.spyOn(remoteCheckoutActionCreator, 'signOut');

            await strategy.signOut({
                methodId: 'amazonpay',
            });

            expect(paymentProcessor.signout).not.toHaveBeenCalled();
            expect(remoteCheckoutActionCreator.signOut).not.toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback: mockCallback,
            });

            expect(mockCallback.mock.calls).toHaveLength(1);
        });
    });
});
