import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import {
    getBraintreeLocalMethods,
    getBraintreeLocalMethodsInitializationOptions,
} from '../braintree.mock';

import { LocalPaymentInstance } from './braintree-local-methods-options';
import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';

describe('BraintreeLocalMethodsPaymentStrategy', () => {
    let strategy: BraintreeLocalMethodsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let localPaymentInstanceMock: LocalPaymentInstance;
    let lpmButton: HTMLButtonElement;

    const initializationOptions: PaymentInitializeOptions = {
        methodId: 'giropay',
        gatewayId: 'braintreelocalmethods',
        braintreelocalmethods: getBraintreeLocalMethodsInitializationOptions(),
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
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

        lpmButton = document.createElement('button');
        lpmButton.id = 'giropay';
        document.body.appendChild(lpmButton);

        paymentMethodMock = {
            ...getBraintreeLocalMethods(),
            clientToken: 'token',
        };

        localPaymentInstanceMock = {
            startPayment: jest.fn(
                (_options: unknown, onPaymentStart: (payload: { paymentId: string }) => void) => {
                    onPaymentStart({ paymentId: '123456' });
                },
            ),
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            getCheckout(),
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
            paymentMethodMock.clientToken,
        );
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockReturnValue(
            paymentMethodMock.clientToken,
        );
        jest.spyOn(braintreeIntegrationService, 'loadBraintreeLocalMethods').mockReturnValue(
            localPaymentInstanceMock,
        );
    });

    afterEach(() => {
        document.body.removeChild(lpmButton);
    });

    it('creates BraintreeLocalMethodsPaymentStrategy', () => {
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

        it('throws error if clientToken is not provided', async () => {
            paymentMethodMock.clientToken = '';
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if initializationData is not provided', async () => {
            paymentMethodMock.initializationData = null;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
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

        it('initializes braintree integration service', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentMethodMock.initializationData,
            );
        });

        it('loads Braintree Local Methods', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.loadBraintreeLocalMethods).toHaveBeenCalled();
        });
    });

    describe('#renderButton', () => {
        it('creates button element with id', async () => {
            await strategy.initialize(initializationOptions);

            const button = document.getElementById('giropay');

            expect(button).toBeDefined();
        });
    });

    describe('#execute', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws PaymentArgumentInvalidError if payment is not provided', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#finalize', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
