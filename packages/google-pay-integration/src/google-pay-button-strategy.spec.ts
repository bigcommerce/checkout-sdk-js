import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from './gateways/google-pay-gateway';
import { WithGooglePayButtonInitializeOptions } from './google-pay-button-initialize-options';
import GooglePayButtonStrategy from './google-pay-button-strategy';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import GooglePayScriptLoader from './google-pay-script-loader';
import { getGeneric } from './mocks/google-pay-payment-method.mock';
import { GooglePayInitializationData } from './types';

describe('GooglePayButtonStrategy', () => {
    const CONTAINER_ID = 'my_awesome_google_pay_button_container';

    let paymentIntegrationService: PaymentIntegrationService;
    let button: HTMLButtonElement;
    let processor: GooglePayPaymentProcessor;
    let strategy: GooglePayButtonStrategy;
    let options: CheckoutButtonInitializeOptions & WithGooglePayButtonInitializeOptions;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getGeneric(),
        );

        button = document.createElement('button');
        jest.spyOn(button, 'remove');

        processor = new GooglePayPaymentProcessor(
            new GooglePayScriptLoader(createScriptLoader()),
            new GooglePayGateway('example', paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        );
        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'addPaymentButton').mockReturnValue(button);

        strategy = new GooglePayButtonStrategy(paymentIntegrationService, processor);

        options = {
            methodId: 'googlepayworldpayaccess',
            containerId: CONTAINER_ID,
        };
    });

    describe('#initialize', () => {
        it('should initialize the strategy', async () => {
            const initialize = strategy.initialize(options);

            await expect(initialize).resolves.toBeUndefined();
        });

        it('should call loadDefaultCheckout', async () => {
            await strategy.initialize(options);

            expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('should initialize processor', async () => {
            const getPaymentMethod = () =>
                (
                    (processor.initialize as jest.Mock).mock
                        .calls[0][0] as () => PaymentMethod<GooglePayInitializationData>
                )();
            const paymentMethod = getGeneric();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(options);

            expect(getPaymentMethod()).toBe(paymentMethod);
        });

        it('should add payment button', async () => {
            await strategy.initialize(options);

            expect(processor.addPaymentButton).toHaveBeenCalledWith(CONTAINER_ID, {
                buttonColor: 'default',
                buttonType: 'plain',
                onClick: expect.any(Function),
            });
        });

        it('should add payment button once', async () => {
            await strategy.initialize(options);
            await strategy.initialize(options);

            expect(processor.addPaymentButton).toHaveBeenCalledTimes(1);
        });

        describe('should fail if:', () => {
            test('methodId is not a google pay key', async () => {
                options.methodId = 'foo';

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#deinitialize', () => {
        it('should deinitialize the strategy', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should remove payment button', async () => {
            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(button.remove).toHaveBeenCalled();
        });
    });
});
