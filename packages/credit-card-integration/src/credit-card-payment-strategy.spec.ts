import { omit } from 'lodash';

import {
    HostedFieldType,
    HostedForm,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    getPaymentMethod,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { CreditCardPaymentStrategy, WithCreditCardPaymentInitializeOptions } from '.';

describe('CreditCardPaymentStrategy', () => {
    let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
    let options: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions;
    let strategy: CreditCardPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new CreditCardPaymentStrategy(paymentIntegrationService);
        form = {
            attach: jest.fn(() => Promise.resolve()),
            submit: jest.fn(() => Promise.resolve()),
            validate: jest.fn(() => Promise.resolve()),
        };
        options = {
            creditCard: {
                form: {
                    fields: {
                        [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                        [HostedFieldType.CardName]: { containerId: 'card-name' },
                        [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                    },
                },
            },
            methodId: 'authorizenet',
        };

        jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            {
                ...getPaymentMethod(),
                config: {
                    isHostedFormEnabled: true,
                },
            },
        );
    });

    describe('#initialize()', () => {
        it('does not create hosted form if form is disabled', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getPaymentMethod(),
                config: {
                    isHostedFormEnabled: false,
                },
            });

            await strategy.initialize(options);

            expect(paymentIntegrationService.createHostedForm).not.toHaveBeenCalled();
        });

        it('does not create hosted form if no fields', async () => {
            options = {
                creditCard: {
                    form: {
                        fields: {},
                    },
                },
                methodId: 'authorizenet',
            };
            await strategy.initialize(options);

            expect(paymentIntegrationService.createHostedForm).not.toHaveBeenCalled();
        });

        it('creates hosted form if form is enabled', async () => {
            const result = await strategy.initialize(options);

            expect(paymentIntegrationService.createHostedForm).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                options.creditCard!.form,
            );
            expect(form.attach).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('#execute()', () => {
        it('throws error when payment data is empty', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        describe('with hosted form', () => {
            it('validates user input before submitting data', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());

                expect(form.validate).toHaveBeenCalled();
            });

            it('does not submit payment data with hosted form if validation fails', async () => {
                jest.spyOn(form, 'validate').mockRejectedValue(new Error());

                try {
                    await strategy.initialize(options);
                    await strategy.execute(getOrderRequestBody());
                } catch (error) {
                    expect(form.submit).not.toHaveBeenCalled();
                }
            });

            it('submits payment data with hosted form', async () => {
                const payload = getOrderRequestBody();

                await strategy.initialize(options);
                await strategy.execute(payload, options);

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                    omit(payload, 'payment'),
                    options,
                );
                expect(form.submit).toHaveBeenCalledWith(payload.payment);
            });
        });

        describe('without hosted form', () => {
            it('does not submit with hosted form', async () => {
                const payload = getOrderRequestBody();
                const { payment, ...order } = payload;
                const paymentData = payment && payment.paymentData;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...getPaymentMethod(),
                    config: {
                        isHostedFormEnabled: false,
                    },
                });

                await strategy.initialize(options);
                await strategy.execute(payload);

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(order, options);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    ...payment,
                    paymentData,
                });
                expect(form.submit).not.toHaveBeenCalled();
            });
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
