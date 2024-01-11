import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { SquareIntent } from './enums';
import { getSquareV2 } from './mocks/squarev2-method.mock';
import SquareV2PaymentProcessor from './squarev2-payment-processor';
import SquareV2PaymentStrategy from './squarev2-payment-strategy';
import SquareV2ScriptLoader from './squarev2-script-loader';

describe('SquareV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: SquareV2PaymentStrategy;
    let processor: SquareV2PaymentProcessor;
    let options: PaymentInitializeOptions;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getSquareV2(),
        );

        processor = new SquareV2PaymentProcessor(
            new SquareV2ScriptLoader(createScriptLoader()),
            paymentIntegrationService,
        );

        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);

        jest.spyOn(processor, 'deinitialize').mockResolvedValue(undefined);

        jest.spyOn(processor, 'initializeCard').mockResolvedValue(undefined);

        jest.spyOn(processor, 'tokenize').mockResolvedValue('cnon:xxx');

        jest.spyOn(processor, 'verifyBuyer').mockResolvedValue('verf:yyy');

        strategy = new SquareV2PaymentStrategy(paymentIntegrationService, processor);

        options = {
            methodId: 'squarev2',
            squarev2: {
                containerId: 'card-container',
                style: { input: { color: 'foo' } },
                onValidationChange: jest.fn(),
            },
        };
    });

    describe('#initialize', () => {
        it('initializes the strategy successfully', async () => {
            const initialize = strategy.initialize(options);

            await expect(initialize).resolves.toBeUndefined();
        });

        it('should initialize the processor', async () => {
            await strategy.initialize(options);

            expect(processor.initialize).toHaveBeenCalledWith({
                applicationId: 'test',
                locationId: 'foo',
                testMode: true,
            });
        });

        it('should initialize the card', async () => {
            await strategy.initialize(options);

            expect(processor.initializeCard).toHaveBeenCalledWith(options.squarev2);
        });

        describe('should fail if...', () => {
            test('containerId is not provided', async () => {
                delete options.squarev2;

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
                expect(processor.initialize).not.toHaveBeenCalled();
                expect(processor.initializeCard).not.toHaveBeenCalled();
            });

            test('there is no payment method data', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockImplementation(() => {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                });

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(MissingDataError);
                expect(processor.initialize).not.toHaveBeenCalled();
                expect(processor.initializeCard).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'squarev2',
                },
            };

            await strategy.initialize(options);
        });

        it('executes the strategy successfully', async () => {
            const execute = strategy.execute(payload);

            await expect(execute).resolves.toBeUndefined();
        });

        it('should tokenize the card to get the nonce', async () => {
            await strategy.execute(payload);

            expect(processor.tokenize).toHaveBeenCalled();
        });

        it('should verify the buyer to get the verification token', async () => {
            const storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3828.add_3ds_support_on_squarev2': true,
            };
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigMock);

            await strategy.execute(payload);

            expect(processor.verifyBuyer).toHaveBeenCalledWith('cnon:xxx', SquareIntent.CHARGE);
        });

        it('should submit the order', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('should submit the payment', async () => {
            const expectedPayment = {
                methodId: 'squarev2',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: 'cnon:xxx',
                        },
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                    },
                },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('should submit the payment with verification token', async () => {
            const expectedPayment = {
                methodId: 'squarev2',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: '{"nonce":"cnon:xxx","token":"verf:yyy"}',
                        },
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                    },
                },
            };
            const storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3828.add_3ds_support_on_squarev2': true,
            };
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigMock);

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        describe('when storing new card', () => {
            beforeEach(async () => {
                payload = {
                    ...getOrderRequestBody(),
                    payment: {
                        methodId: 'squarev2',
                        paymentData: {
                            shouldSaveInstrument: true,
                        },
                    },
                };

                await strategy.initialize(options);
            });

            it('should tokenize the card twice', async () => {
                await strategy.execute(payload);

                expect(processor.tokenize).toHaveBeenCalledTimes(2);
            });

            it('should verify the buyer twice to get two verification tokens with different intents', async () => {
                const storeConfigMock = getConfig().storeConfig;

                storeConfigMock.checkoutSettings.features = {
                    'PROJECT-3828.add_3ds_support_on_squarev2': true,
                };
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getStoreConfigOrThrow',
                ).mockReturnValue(storeConfigMock);

                await strategy.execute(payload);

                expect(processor.verifyBuyer).toHaveBeenCalledWith('cnon:xxx', SquareIntent.CHARGE);
                expect(processor.verifyBuyer).toHaveBeenCalledWith('cnon:xxx', SquareIntent.STORE);
            });

            it('should submit the payment with verification tokens', async () => {
                const expectedPayment = {
                    methodId: 'squarev2',
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: '{"nonce":"cnon:xxx","store_card_nonce":"cnon:xxx","token":"verf:yyy","store_card_token":"verf:yyy"}',
                            },
                            vault_payment_instrument: true,
                            set_as_default_stored_instrument: false,
                        },
                    },
                };
                const storeConfigMock = getConfig().storeConfig;

                storeConfigMock.checkoutSettings.features = {
                    'PROJECT-3828.add_3ds_support_on_squarev2': true,
                };
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getStoreConfigOrThrow',
                ).mockReturnValue(storeConfigMock);

                await strategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expectedPayment,
                );
            });
        });

        describe('when using a stored card', () => {
            beforeEach(async () => {
                payload = {
                    ...getOrderRequestBody(),
                    payment: {
                        methodId: 'squarev2',
                        paymentData: {
                            instrumentId: 'bigpaytoken',
                        },
                    },
                };

                await strategy.initialize(options);
            });

            it('should not tokenize the card', async () => {
                await strategy.execute(payload);

                expect(processor.tokenize).not.toHaveBeenCalled();
            });

            it('should submit the payment', async () => {
                const storeConfigMock = getConfig().storeConfig;

                storeConfigMock.checkoutSettings.features = {
                    'PROJECT-3828.add_3ds_support_on_squarev2': false,
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getStoreConfigOrThrow',
                ).mockReturnValue(storeConfigMock);

                const expectedPayment = {
                    methodId: 'squarev2',
                    paymentData: {
                        formattedPayload: {
                            bigpay_token: {
                                token: 'bigpaytoken',
                            },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                };

                await strategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expectedPayment,
                );
            });

            it('should submit the payment with verification token', async () => {
                const storeConfigMock = getConfig().storeConfig;
                const squareCardsDataMock = [
                    { bigpay_token: 'bigpaytoken', provider_card_token: 'ccof:yyy' },
                ];

                storeConfigMock.checkoutSettings.features = {
                    'PROJECT-3828.add_3ds_support_on_squarev2': true,
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getStoreConfigOrThrow',
                ).mockReturnValue(storeConfigMock);

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...getSquareV2(),
                    initializationData: {
                        squareCardsData: squareCardsDataMock,
                    },
                });

                const expectedPayment = {
                    methodId: 'squarev2',
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: '{"card_id":"ccof:yyy","token":"verf:yyy"}',
                            },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                };

                await strategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expectedPayment,
                );
            });
        });
    });

    describe('#finalize', () => {
        it('throws error to inform that order finalization is not required', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes the strategy successfully', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should deinitialize the processor', async () => {
            await strategy.deinitialize();

            expect(processor.deinitialize).toHaveBeenCalled();
        });
    });
});
