import {
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
    getAmazonPayV2,
    getAmazonPayV2PaymentProcessorMock,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    NotImplementedError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { WithAmazonPayV2CustomerInitializeOptions } from './amazon-pay-v2-customer-initialize-options';
import AmazonPayV2CustomerStrategy from './amazon-pay-v2-customer-strategy';
import { getAmazonPayV2CustomerInitializeOptions, Mode } from './mock/amazon-pay-v2-customer.mock';

describe('AmazonPayV2CustomerStrategy', () => {
    let customerInitializeOptions: CustomerInitializeOptions &
        WithAmazonPayV2CustomerInitializeOptions;
    let amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor;
    let strategy: AmazonPayV2CustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethodMock: PaymentMethod;

    beforeEach(() => {
        customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();
        amazonPayV2PaymentProcessor =
            getAmazonPayV2PaymentProcessorMock() as unknown as AmazonPayV2PaymentProcessor;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paymentMethodMock = getAmazonPayV2();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        strategy = new AmazonPayV2CustomerStrategy(
            paymentIntegrationService,
            amazonPayV2PaymentProcessor,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('should initialize the processor', async () => {
            await strategy.initialize(customerInitializeOptions);

            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(getAmazonPayV2());
        });

        it('should render the button', async () => {
            await strategy.initialize(customerInitializeOptions);

            expect(amazonPayV2PaymentProcessor.renderAmazonPayButton).toHaveBeenCalledWith({
                checkoutState: paymentIntegrationService.getState(),
                containerId: 'amazonpayCheckoutButton',
                methodId: 'amazonpay',
                placement: AmazonPayV2Placement.Checkout,
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

            test('if there is no payment method data', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockImplementation(() => {
                    throw new PaymentArgumentInvalidError();
                });

                strategy = new AmazonPayV2CustomerStrategy(
                    paymentIntegrationService,
                    amazonPayV2PaymentProcessor,
                );

                const initialize = strategy.initialize(customerInitializeOptions);

                await expect(initialize).rejects.toThrow(PaymentArgumentInvalidError);
            });
        });
    });

    describe('#deinitialize', () => {
        it('succesfully deinitializes the strategy', async () => {
            await strategy.deinitialize();

            expect(amazonPayV2PaymentProcessor.deinitialize).toHaveBeenCalled();
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
            const signOutMock = jest.spyOn(amazonPayV2PaymentProcessor, 'signout');
            const remoteCheckoutSignOutMock = jest.spyOn(
                paymentIntegrationService,
                'remoteCheckoutSignOut',
            );

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentId').mockReturnValueOnce({
                providerId: 'amazonpay',
            });
            remoteCheckoutSignOutMock.mockImplementation(jest.fn());

            await strategy.signOut({
                methodId: 'amazonpay',
            } as RequestOptions);

            expect(signOutMock).toHaveBeenCalledTimes(1);
            expect(remoteCheckoutSignOutMock).toHaveBeenCalledTimes(1);
        });

        it('does nothing if already signed out from remote checkout provider', async () => {
            const signOutMock = jest.spyOn(amazonPayV2PaymentProcessor, 'signout');
            const remoteCheckoutSignOutMock = jest.spyOn(
                paymentIntegrationService,
                'remoteCheckoutSignOut',
            );

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentId').mockReturnValueOnce(
                undefined,
            );
            remoteCheckoutSignOutMock.mockImplementation(jest.fn());

            await strategy.signOut({
                methodId: 'amazonpay',
            } as RequestOptions);

            expect(signOutMock).not.toHaveBeenCalled();
            expect(remoteCheckoutSignOutMock).not.toHaveBeenCalled();
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
