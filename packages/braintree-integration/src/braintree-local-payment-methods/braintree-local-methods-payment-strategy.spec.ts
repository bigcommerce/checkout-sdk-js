import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    getBraintreeLocalPaymentMock,
    LocalPaymentInstance,
    NonInstantLocalPaymentMethods,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    getBraintreeLocalMethods,
    getBraintreeLocalMethodsInitializationOptions,
} from '../mocks/braintree.mock';

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

        localPaymentInstanceMock = getBraintreeLocalPaymentMock();

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

        describe('when non-instant payment method', () => {
            let payload: OrderRequestBody;

            beforeEach(() => {
                payload = {
                    payment: {
                        gatewayId: 'braintreelocalmethods',
                        methodId: NonInstantLocalPaymentMethods.TRUSTLY,
                        paymentData: {
                            phoneNumber: '380112223344',
                        },
                    },
                };

                Object.defineProperty(window, 'location', {
                    value: {
                        replace: jest.fn(),
                    },
                });
            });

            it('should not use startPayment method', async () => {
                await strategy.execute(payload);

                expect(localPaymentInstanceMock.startPayment).not.toHaveBeenCalled();
            });

            it('throws an error if phone number was not passed as required parameter', async () => {
                try {
                    await strategy.execute({
                        ...payload,
                        payment: {
                            ...payload.payment,
                            paymentData: {},
                        },
                    });
                } catch (error) {
                    expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
                }
            });

            it('submits order payload with payment data', async () => {
                await strategy.execute(payload);

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            });

            it('submits payment payload with payment data', async () => {
                await strategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'trustly',
                        paymentData: expect.objectContaining({
                            formattedPayload: expect.objectContaining({
                                device_info: 'token',
                                method_id: 'trustly',
                                set_as_default_stored_instrument: null,
                                trustly_account: expect.objectContaining({
                                    phone: '380112223344',
                                }),
                            }),
                        }),
                    }),
                );
            });

            it('when submit payment returns additional action required specific error', async () => {
                const error = new RequestError(
                    getResponse({
                        additional_action_required: {
                            type: 'offsite_redirect',
                            data: {
                                redirect_url: 'redirect_url',
                            },
                        },
                    }),
                );

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(error),
                );

                try {
                    await strategy.execute(payload);
                } catch (_) {
                    expect(window.location.replace).toHaveBeenCalledWith('redirect_url');
                }
            });
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
