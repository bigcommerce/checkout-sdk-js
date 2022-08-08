import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { of } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotImplementedError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentProcessor, AmazonPayV2ButtonParams } from '../../../payment/strategies/amazon-pay-v2';
import { getAmazonPayV2ButtonParamsMock } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutActionType, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';

import { AmazonPayV2CustomerInitializeOptions } from '.';
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
        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        strategy = new AmazonPayV2CustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            paymentProcessor
        );

        customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        jest.spyOn(paymentProcessor, 'signout')
            .mockReturnValue(Promise.resolve());

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
            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('creates the button', async () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock() as AmazonPayV2ButtonParams;
            expectedOptions.createCheckoutSession.url = `${getConfig().storeConfig.storeProfile.shopPath}/remote-checkout/amazonpay/payment-session`;

            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                'amazonpayCheckoutButton',
                expectedOptions
            );
        });

        describe('should fail...', () => {
            test('if methodId is not provided', async () => {
                customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(Mode.UndefinedMethodId);

                await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
            });

            test('if containerId is not provided', async () => {
                customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(Mode.Incomplete);

                await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
            });

            test('if there is no payment method data', async () => {
                const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
                const state = { ...getCheckoutStoreState(), paymentMethods };
                store = createCheckoutStore(state);
                strategy = new AmazonPayV2CustomerStrategy(
                    store,
                    paymentMethodActionCreator,
                    remoteCheckoutActionCreator,
                    paymentProcessor
                );

                await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(MissingDataError);
            });
        });

    });

    describe('#deinitialize()', () => {
        it('succesfully deinitializes the strategy', async () => {
            const { container: containerId } = customerInitializeOptions.amazonpay as AmazonPayV2CustomerInitializeOptions;

            await strategy.initialize(customerInitializeOptions);
            await strategy.deinitialize();

            const buttonContainer = document.getElementById(containerId);

            expect(buttonContainer).toBeNull();
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            await strategy.initialize(customerInitializeOptions);

            expect(strategy.signIn).toThrow(NotImplementedError);
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            await strategy.initialize(customerInitializeOptions);
        });

        it('signs out from Amazon and remote checkout provider', async () => {
            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValueOnce({
                    providerId: 'amazonpay',
                });
            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue(of(createAction(RemoteCheckoutActionType.ForgetCheckoutRemoteCustomerSucceeded)));

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

            await strategy.executePaymentMethodCheckout({ continueWithCheckoutCallback: mockCallback });

            expect(mockCallback.mock.calls.length).toBe(1);
        });
    });
});
