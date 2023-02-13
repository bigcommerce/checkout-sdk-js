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

import BlueSnapDirectCreditCardPaymentStrategy from './bluesnap-direct-credit-card-payment-strategy';
import BlueSnapDirectHostedForm from './bluesnap-direct-hosted-form';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import BluesnapDirectNameOnCardInput from './bluesnap-direct-name-on-card-input';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import { getBlueSnapDirect } from './mocks/bluesnap-direct-method.mock';

describe('BlueSnapDirectCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: BlueSnapDirectScriptLoader;
    let nameOnCardInput: BluesnapDirectNameOnCardInput;
    let hostedInputValidator: BlueSnapHostedInputValidator;
    let hostedForm: BlueSnapDirectHostedForm;
    let strategy: BlueSnapDirectCreditCardPaymentStrategy;
    let options: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;

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

        jest.spyOn(hostedForm, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(hostedForm, 'attach').mockResolvedValue(undefined);
        jest.spyOn(hostedForm, 'validate').mockReturnValue(hostedForm);
        jest.spyOn(hostedForm, 'submit').mockResolvedValue({ cardHolderName: 'John Doe' });
        jest.spyOn(hostedForm, 'detach').mockReturnValue(undefined);

        strategy = new BlueSnapDirectCreditCardPaymentStrategy(
            paymentIntegrationService,
            hostedForm,
        );

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

            expect(hostedForm.initialize).toHaveBeenCalledWith(true);
        });

        it('should attach BlueSnap hosted form', async () => {
            await strategy.initialize(options);

            expect(hostedForm.attach).toHaveBeenCalledWith('pfToken', options.creditCard);
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

            test('fields is not a HostedCardFieldOptionsMap', async () => {
                const initialize = () => {
                    options = {
                        ...options,
                        creditCard: { form: { fields: {} } },
                    };

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

        it('should submit validated data to BlueSnap servers', async () => {
            await strategy.execute(payload);

            expect(hostedForm.validate).toHaveBeenCalled();
            expect(hostedForm.submit).toHaveBeenCalled();
        });

        it('should submit the order', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('should submit the payment', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                gatewayId: 'bluesnapdirect',
                methodId: 'credit_card',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: '{"pfToken":"pfToken","cardHolderName":"John Doe"}',
                        },
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
            await strategy.deinitialize();

            expect(hostedForm.detach).toHaveBeenCalled();
        });
    });
});
