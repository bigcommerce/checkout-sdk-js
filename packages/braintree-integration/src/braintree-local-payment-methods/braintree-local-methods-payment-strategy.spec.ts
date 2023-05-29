import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import { getBraintreeLocalMethods, getBraintreeLocalMethodsObject } from '../braintree.mock';
import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

describe('BraintreeLocalMethods', () => {
    let strategy: BraintreeLocalMethodsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentMethodMock: PaymentMethod;

    const initializationOptions: PaymentInitializeOptions = {
        methodId: 'giropay',
        gatewayId: 'braintreelocalmethods',
        braintreelocalmethods: getBraintreeLocalMethodsObject(),
    };

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        strategy = new BraintreeLocalMethodsPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
            new LoadingIndicator(),
        );

        paymentMethodMock = {
            ...getBraintreeLocalMethods(),
            clientToken: 'token',
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
            paymentMethodMock.clientToken,
        );

        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockReturnValue(
            paymentMethodMock.clientToken,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            getCheckout(),
        );

        jest.spyOn(braintreeIntegrationService, 'loadBraintreeLocalMethods').mockReturnValue(
            getBraintreeLocalMethods(),
        );
    });

    it('creates braintree local methods payment strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeLocalMethodsPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if gatewayId is not provided', async () => {
            const options = {
                methodId: 'giropay',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if options.braintreelocalmethods is not provided', async () => {
            const options = {
                methodId: 'giropay',
                gatewayId: 'barintreelocalmethods',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads braintree local methods', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.loadBraintreeLocalMethods).toHaveBeenCalled();
        });
    });

    describe('#renderButton()', () => {
        it('creates button element with id', async () => {
            await strategy.initialize(initializationOptions);
            const button = document.getElementById('giropay');
            expect(button).toBeDefined();
        });
    });

    describe('#execute()', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if orderId is not defined', async () => {
            const payload = {
                payment: {
                    methodId: 'giropay',
                    gatewayId: 'braintreelocalmethods',
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
            }
        });

        //TODO: ON APPROVE CALLS
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
