import { Action, createAction } from '@bigcommerce/data-store';
import { merge, omit } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    HostedFieldType,
    HostedForm,
    LoadOrderSucceededAction,
    NotInitializedError,
    OrderActionType,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrder,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import WorldpayAccessPaymetStrategy from './worldpayaccess-payment-strategy';

describe('WorldpayAccessPaymetStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: WorldpayAccessPaymetStrategy;
    let submitOrderAction: Observable<Action>;
    let initializeOptions: PaymentInitializeOptions;

    const payload = getOrderRequestBody();
    const PAYMENT_CANNOT_CONTINUE = 'Payment cannot continue';

    const errorResponseAdditionalAction = new RequestError(
        getResponse({
            ...getErrorPaymentResponseBody(),
            errors: [{ code: 'additional_action_required' }],
            additional_action_required: {
                type: 'unknown_action',
                data: {
                    redirect_url: 'http://url.com',
                },
            },
            provider_data: {
                source_id: '5313',
                data: 'jwt_token',
            },
            status: 'error',
        }),
    );

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        strategy = new WorldpayAccessPaymetStrategy(paymentIntegrationService);

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }),
        );

        HTMLFormElement.prototype.submit = () => {
            window.parent.postMessage(
                '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                '*',
            );
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws error when initialize with worldpay data is required', async () => {
        initializeOptions = { methodId: 'worldpayaccess' };

        await expect(strategy.initialize(initializeOptions)).rejects.toThrow(NotInitializedError);
    });

    it('throws error when is missing payment data', async () => {
        const payloadWithoutPayment = omit(payload, 'payment');

        await expect(strategy.execute(payloadWithoutPayment)).rejects.toThrow(
            PaymentArgumentInvalidError,
        );
    });

    it('submits order without payment data', async () => {
        await strategy.execute(payload);

        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
            omit(payload, 'payment'),
            undefined,
        );
    });

    it('submits payment separately', async () => {
        await strategy.execute(payload);

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(payload.payment);
    });

    it('throws error to inform that order finalization is not required', async () => {
        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    describe('when hosted form is enabled', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
        let loadOrderAction: Observable<LoadOrderSucceededAction>;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
            };

            initializeOptions = {
                methodId: 'worldpayaccess',
                creditCard: {
                    form: {
                        fields: {
                            [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                            [HostedFieldType.CardName]: { containerId: 'card-name' },
                            [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                        },
                    },
                },
                worldpay: {
                    onLoad: jest.fn(),
                },
            };

            loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));

            jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockReturnValue(
                loadOrderAction,
            );
            jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(paymentIntegrationService.createHostedForm).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                {
                    fields: {
                        [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                        [HostedFieldType.CardName]: { containerId: 'card-name' },
                        [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                    },
                },
            );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach).toHaveBeenCalled();
        });

        it('submits payment', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(form.submit).not.toHaveBeenCalled();
            }
        });

        it('submit with collection data required hosted', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledTimes(1);
        });

        describe('when hosted fields are not present for rendering', () => {
            beforeEach(() => {
                form = {
                    attach: jest.fn(() => Promise.resolve()),
                    submit: jest.fn(() => Promise.resolve()),
                    validate: jest.fn(() => Promise.resolve()),
                };
                initializeOptions = {
                    creditCard: {
                        form: {
                            fields: {},
                        },
                    },
                    methodId: 'worldpayaccess',
                    worldpay: {
                        onLoad: jest.fn(),
                    },
                };
                loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));

                jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockReturnValue(
                    loadOrderAction,
                );
                jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
            });

            it('does not create hosted form', async () => {
                await strategy.initialize(initializeOptions);
                jest.clearAllMocks();

                expect(paymentIntegrationService.createHostedForm).not.toHaveBeenCalled();
            });

            it('does not submit with hosted form', async () => {
                await strategy.initialize(initializeOptions);
                await strategy.execute(payload);

                expect(form.submit).not.toHaveBeenCalled();
            });
        });
    });

    describe('when 3DS is required', () => {
        let threeDSecureRequiredErrorResponse: RequestError;
        const onLoad = jest.fn().mockImplementation(() => {
            throw new Error();
        });

        beforeEach(() => {
            threeDSecureRequiredErrorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: {
                        acs_url: 'acs_url',
                        payer_auth_request: 'payer_auth_request',
                        merchant_data: 'merchant_data',
                    },
                }),
            );

            initializeOptions = {
                methodId: 'worldpayaccess',
                worldpay: {
                    onLoad,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(
                merge(getPaymentMethod(), { config: { isHostedFormEnabled: false } }),
            );
        });

        it('throws error when three_d_secure_required code is missing', async () => {
            threeDSecureRequiredErrorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'other_error' }],
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => {
                    throw errorResponseAdditionalAction;
                })
                .mockImplementationOnce(() => {
                    throw threeDSecureRequiredErrorResponse;
                });

            await strategy.initialize(initializeOptions);

            const promise = strategy.execute(payload);

            await expect(promise).rejects.toThrow(RequestError);
        });

        it('throws error when initializeOptions is missing', async () => {
            const threeDSecureRequiredErrorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: {
                        acs_url: 'acs_url',
                        payer_auth_request: 'payer_auth_request',
                        merchant_data: 'merchant_data',
                    },
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.reject(threeDSecureRequiredErrorResponse));

            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
        });

        it('validate iframe to open modal', async () => {
            const onLoad = jest.fn().mockImplementation(() => {
                throw new Error();
            });

            initializeOptions = {
                ...initializeOptions,
                worldpay: {
                    onLoad,
                },
            };
            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.reject(threeDSecureRequiredErrorResponse));

            const form = document.createElement('form');

            form.id = 'challengeForm';
            form.method = 'POST';
            form.action = threeDSecureRequiredErrorResponse.body.three_ds_result.acs_url;

            const inputJWT = document.createElement('input');

            inputJWT.name = 'JWT';
            inputJWT.type = 'hidden';
            inputJWT.value =
                threeDSecureRequiredErrorResponse.body.three_ds_result.payer_auth_request;
            form.appendChild(inputJWT);

            const merchant = document.createElement('input');

            merchant.name = 'MD';
            merchant.type = 'hidden';
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            merchant.value = `merchantSessionId=${threeDSecureRequiredErrorResponse.body.three_ds_result.merchant_data}`;
            form.appendChild(merchant);

            const script = document.createElement('script');

            script.type = 'text/javascript';
            script.innerHTML =
                "window.onload = function() { document.getElementById('challengeForm').submit(); }";

            const iframe = document.createElement('iframe');

            iframe.name = 'worldpay_hosted_payment_page';
            iframe.height = '400';
            iframe.width = '100%';
            iframe.srcdoc = `${form.outerHTML} ${script.outerHTML}`;

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(Error);
            expect(onLoad).toHaveBeenCalledWith(iframe, expect.any(Function));
        });

        it('throws error when is 3ds authentication is cancelled', async () => {
            const onLoad = jest.fn((_, b) => b());

            initializeOptions = {
                ...initializeOptions,
                worldpay: {
                    onLoad,
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.reject(threeDSecureRequiredErrorResponse));

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(Error);
        });

        it('throws error when the modal failed', async () => {
            const onLoad = jest.fn().mockImplementation(() => {
                throw new Error();
            });

            initializeOptions = {
                ...initializeOptions,
                worldpay: {
                    onLoad,
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.reject(threeDSecureRequiredErrorResponse));

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(Error);
        });
    });

    describe('when hosted form is disable', () => {
        beforeEach(() => {
            initializeOptions = {
                methodId: 'worldpayaccess',
                worldpay: {
                    onLoad: jest.fn(),
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(
                merge(getPaymentMethod(), { config: { isHostedFormEnabled: false } }),
            );
        });

        it('submit with collection data required', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        threeDSecure: expect.objectContaining({ token: 'token' }),
                    }),
                }),
            );
        });

        it("stop event execution when the event message string isn't a json", async () => {
            HTMLFormElement.prototype.submit = () =>
                window.parent.postMessage('invalid string', '*');

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message string isn't a valid json with SessionId", async () => {
            HTMLFormElement.prototype.submit = () =>
                window.parent.postMessage('{"MessageType":"profile.completed","Status":true}', '*');

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message isn't string", async () => {
            HTMLFormElement.prototype.submit = () => window.parent.postMessage({}, '*');

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("throws error when hidden iframe isn't created", async () => {
            const createElement = window.document.createElement;

            window.document.createElement = jest.fn().mockImplementationOnce(() => {
                return undefined;
            });

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);

            window.document.createElement = createElement;
        });

        it("throws error when hidden iframe hasn't contentWindow", async () => {
            const append = window.document.body.appendChild;

            window.document.body.appendChild = jest.fn().mockImplementationOnce(() => {
                return undefined;
            });

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);

            window.document.body.appendChild = append;
        });
    });
});
