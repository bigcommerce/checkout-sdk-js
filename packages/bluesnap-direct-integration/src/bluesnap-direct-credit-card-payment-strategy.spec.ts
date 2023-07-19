import { createScriptLoader } from '@bigcommerce/script-loader';

import { WithCreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    HostedFieldType,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirect3ds from './bluesnap-direct-3ds';
import BlueSnapDirectCreditCardPaymentStrategy from './bluesnap-direct-credit-card-payment-strategy';
import BlueSnapDirectHostedForm from './bluesnap-direct-hosted-form';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import BluesnapDirectNameOnCardInput from './bluesnap-direct-name-on-card-input';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import { getBlueSnapDirect } from './mocks/bluesnap-direct-method.mock';
import { previouslyUsedCardDataMock } from './mocks/bluesnap-direct-sdk.mock';

describe('BlueSnapDirectCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: BlueSnapDirectScriptLoader;
    let nameOnCardInput: BluesnapDirectNameOnCardInput;
    let hostedInputValidator: BlueSnapHostedInputValidator;
    let hostedForm: BlueSnapDirectHostedForm;
    let bluesnapdirect3ds: BlueSnapDirect3ds;
    let strategy: BlueSnapDirectCreditCardPaymentStrategy;
    let options: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions;
    let optionsCardValidation: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions;
    let optionsCardValidationWithoutFields: PaymentInitializeOptions &
        WithCreditCardPaymentInitializeOptions;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getBlueSnapDirect(),
        );

        scriptLoader = new BlueSnapDirectScriptLoader(createScriptLoader());
        nameOnCardInput = new BluesnapDirectNameOnCardInput();
        hostedInputValidator = new BlueSnapHostedInputValidator();
        hostedForm = new BlueSnapDirectHostedForm(
            scriptLoader,
            nameOnCardInput,
            hostedInputValidator,
        );
        bluesnapdirect3ds = new BlueSnapDirect3ds(scriptLoader);

        jest.spyOn(hostedForm, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(hostedForm, 'attach').mockResolvedValue(undefined);
        jest.spyOn(hostedForm, 'validate').mockReturnValue(hostedForm);
        jest.spyOn(hostedForm, 'submit').mockResolvedValue({ cardHolderName: 'John Doe' });
        jest.spyOn(hostedForm, 'detach').mockResolvedValue(undefined);
        jest.spyOn(bluesnapdirect3ds, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(bluesnapdirect3ds, 'initialize3ds').mockResolvedValue('3dsId');

        strategy = new BlueSnapDirectCreditCardPaymentStrategy(
            paymentIntegrationService,
            hostedForm,
            bluesnapdirect3ds,
        );

        optionsCardValidationWithoutFields = {
            creditCard: {
                form: {
                    fields: {
                        [HostedFieldType.CardNumberVerification]: undefined,
                        [HostedFieldType.CardCodeVerification]: undefined,
                    },
                },
            },
            gatewayId: 'bluesnapdirect',
            methodId: 'credit_card',
        };

        optionsCardValidation = {
            creditCard: {
                form: {
                    fields: {
                        [HostedFieldType.CardNumberVerification]: {
                            containerId: 'card-number',
                            instrumentId: 'card-number-instrumentId',
                        },
                        [HostedFieldType.CardCodeVerification]: {
                            containerId: 'card-code',
                            instrumentId: 'card-code-instrumentId',
                        },
                    },
                },
            },
            gatewayId: 'bluesnapdirect',
            methodId: 'credit_card',
        };

        options = {
            creditCard: {
                form: {
                    fields: {
                        [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                        [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                        [HostedFieldType.CardName]: { containerId: 'card-name' },
                        [HostedFieldType.CardCode]: { containerId: 'card-code' },
                    },
                },
            },
            gatewayId: 'bluesnapdirect',
            methodId: 'credit_card',
        };
    });

    describe('#initialize()', () => {
        afterEach(() => {
            (paymentIntegrationService.createHostedForm as jest.Mock).mockClear();
        });

        it('initializes the strategy successfully', async () => {
            const initialize = strategy.initialize(options);

            await expect(initialize).resolves.toBeUndefined();
        });

        it('should initialize BlueSnap hosted form', async () => {
            await strategy.initialize(options);

            expect(hostedForm.initialize).toHaveBeenCalledWith(
                true,
                options.creditCard?.form.fields,
            );
        });

        it('should attach BlueSnap hosted form for credit card form', async () => {
            await strategy.initialize(options);

            expect(hostedForm.attach).toHaveBeenCalledWith(
                'pfToken',
                options.creditCard,
                undefined,
            );
        });

        it('should attach BlueSnap hosted form for credit card validation form', async () => {
            await strategy.initialize(optionsCardValidation);

            expect(hostedForm.attach).toHaveBeenCalledWith(
                'pfToken',
                optionsCardValidation.creditCard,
                undefined,
            );
        });

        it("shouldn't attach BlueSnap hosted form for credit card validation form", async () => {
            await strategy.initialize(optionsCardValidationWithoutFields);

            expect(hostedForm.attach).not.toHaveBeenCalled();
        });

        it('should attach BlueSnap hosted form with 3DS enabled', async () => {
            const initialize = () => {
                const method = getBlueSnapDirect();

                method.config.is3dsEnabled = true;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(method);

                return strategy.initialize(options);
            };

            await initialize();

            expect(hostedForm.attach).toHaveBeenCalledWith('pfToken', options.creditCard, true);
        });

        describe('should fail if...', () => {
            test('gatewayId is not provided', async () => {
                const initialize = () => {
                    options.gatewayId = undefined;

                    return strategy.initialize(options);
                };

                await expect(initialize()).rejects.toThrow(InvalidArgumentError);
                expect(paymentIntegrationService.createHostedForm).not.toHaveBeenCalled();
            });

            test('creditCard is not provided', async () => {
                const initialize = () => {
                    options.creditCard = undefined;

                    return strategy.initialize(options);
                };

                await expect(initialize()).rejects.toThrow(InvalidArgumentError);
                expect(paymentIntegrationService.createHostedForm).not.toHaveBeenCalled();
            });

            test('there is no payment method data', async () => {
                const initialize = () => {
                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getPaymentMethodOrThrow',
                    ).mockImplementation(() => {
                        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                    });

                    return strategy.initialize(options);
                };

                await expect(initialize()).rejects.toThrow(MissingDataError);
                expect(hostedForm.initialize).not.toHaveBeenCalled();
                expect(hostedForm.attach).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute()', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'credit_card',
                },
            };

            await strategy.initialize(options);
        });

        it('executes the strategy successfully', async () => {
            const execute = strategy.execute(payload);

            await expect(execute).resolves.toBeUndefined();
        });

        it('should submit validated payment data to BlueSnap servers', async () => {
            await strategy.execute(payload);

            expect(hostedForm.validate).toHaveBeenCalled();
            expect(hostedForm.submit).toHaveBeenCalled();
        });

        it("shouldn't submit validated payment data to BlueSnap servers when hosted fields isn't mounted", async () => {
            await strategy.initialize(optionsCardValidationWithoutFields);
            await strategy.execute(payload);

            expect(hostedForm.validate).not.toHaveBeenCalled();
            expect(hostedForm.submit).not.toHaveBeenCalled();
        });

        it('should submit payment data to BlueSnap servers and include 3DS data', async () => {
            const expectedData = {
                amount: 190,
                currency: 'USD',
                billingFirstName: 'Test',
                billingLastName: 'Tester',
                billingCountry: 'US',
                billingState: 'CA',
                billingCity: 'Some City',
                billingAddress: '12345 Testing Way',
                billingZip: '95555',
                shippingFirstName: 'Test',
                shippingLastName: 'Tester',
                shippingCountry: 'US',
                shippingState: 'CA',
                shippingCity: 'Some City',
                shippingAddress: '12345 Testing Way',
                shippingZip: '95555',
                email: 'test@bigcommerce.com',
                phone: '555-555-5555',
            };
            const execute = () => {
                const method = getBlueSnapDirect();

                method.config.is3dsEnabled = true;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(method);

                return strategy.execute(payload);
            };

            await execute();

            expect(hostedForm.submit).toHaveBeenCalledWith(expectedData, true);
        });

        it('should submit the order', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('should submit the payment with cardHolderName for credit card form', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: '{"pfToken":"pfToken","cardHolderName":"John Doe"}',
                        },
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                    },
                },
            });
        });

        it('should submit the payment without cardHolderName for validate credit card form', async () => {
            await strategy.initialize(optionsCardValidation);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: '{"pfToken":"pfToken"}',
                        },
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                    },
                },
            });
        });

        it('should submit the payment with stored card with card validation form', async () => {
            payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'credit_card',
                    paymentData: { shouldSetAsDefaultInstrument: false, instrumentId: 'id' },
                },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    instrumentId: 'id',
                    nonce: 'pfToken',
                    shouldSetAsDefaultInstrument: false,
                },
            });
        });

        it('should submit the payment with stored card without card validation form', async () => {
            await strategy.initialize(optionsCardValidationWithoutFields);
            payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'credit_card',
                    paymentData: { shouldSetAsDefaultInstrument: false, instrumentId: 'id' },
                },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    instrumentId: 'id',
                    shouldSetAsDefaultInstrument: false,
                },
            });
        });

        it('should submit the payment with stored card with 3ds enabled', async () => {
            const execute = async () => {
                const method = getBlueSnapDirect();

                method.config.is3dsEnabled = true;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(method);

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getCardInstrumentOrThrow',
                ).mockReturnValue({
                    last4: previouslyUsedCardDataMock.last4Digits,
                    brand: previouslyUsedCardDataMock.ccType,
                });

                await strategy.execute({
                    payment: {
                        gatewayId: 'bluesnapdirect',
                        methodId: 'credit_card',
                        paymentData: { shouldSetAsDefaultInstrument: false, instrumentId: 'id' },
                    },
                });
            };

            await strategy.initialize(optionsCardValidationWithoutFields);

            await execute();

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    deviceSessionId: '3dsId',
                    instrumentId: 'id',
                    shouldSetAsDefaultInstrument: false,
                },
            });
        });

        it('should submit the payment with stored card with 3ds disabled', async () => {
            const execute = async () => {
                const method = getBlueSnapDirect();

                method.config.is3dsEnabled = false;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(method);

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getCardInstrumentOrThrow',
                ).mockReturnValue({
                    last4: previouslyUsedCardDataMock.last4Digits,
                    brand: previouslyUsedCardDataMock.ccType,
                });

                await strategy.execute({
                    payment: {
                        gatewayId: 'bluesnapdirect',
                        methodId: 'credit_card',
                        paymentData: { shouldSetAsDefaultInstrument: false, instrumentId: 'id' },
                    },
                });
            };

            await strategy.initialize(optionsCardValidationWithoutFields);

            await execute();

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    instrumentId: 'id',
                    shouldSetAsDefaultInstrument: false,
                },
            });
        });

        it('should submit the payment and save card', async () => {
            payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'credit_card',
                    paymentData: {
                        shouldSaveInstrument: true,
                        shouldSetAsDefaultInstrument: true,
                    },
                },
            };
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: '{"pfToken":"pfToken","cardHolderName":"John Doe"}',
                        },
                        vault_payment_instrument: true,
                        set_as_default_stored_instrument: true,
                    },
                },
            });
        });

        describe('should fail if...', () => {
            test('payload.payment is not provided', async () => {
                const execute = () => strategy.execute({ ...payload, payment: undefined });

                await expect(execute()).rejects.toThrow(PaymentArgumentInvalidError);
            });
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes the strategy successfully', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should detach BlueSnap hosted form', async () => {
            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(hostedForm.detach).toHaveBeenCalled();
        });

        it("shouldn't detach BlueSnap hosted form if not initialized", async () => {
            await strategy.initialize(optionsCardValidationWithoutFields);
            await strategy.deinitialize();

            expect(hostedForm.detach).not.toHaveBeenCalled();
        });
    });
});
