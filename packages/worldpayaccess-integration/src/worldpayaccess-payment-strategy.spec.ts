import { merge, omit } from 'lodash';

import {
    HostedFieldType,
    HostedForm,
    HostedInputEventType,
    HostedInputSubmitSuccessEvent,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import WorldpayAccessPaymetStrategy from './worldpayaccess-payment-strategy';

describe('WorldpayAccessPaymetStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: WorldpayAccessPaymetStrategy;
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

    const mockHostedInputSubmitSuccessEvent: HostedInputSubmitSuccessEvent = {
        type: HostedInputEventType.SubmitSucceeded,
        payload: {
            response: {
                body: 'body',
                headers: {
                    header: 'header',
                },
                status: 1,
                statusText: 'statusText',
            },
        },
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new WorldpayAccessPaymetStrategy(paymentIntegrationService);

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }),
        );

        HTMLFormElement.prototype.submit = jest.fn();
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
        let form: HostedForm;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                detach: jest.fn(() => Promise.resolve()),
                getBin: jest.fn(() => 'bin'),
                getCardType: jest.fn(() => 'cardType'),
                submit: jest.fn(() => Promise.resolve(mockHostedInputSubmitSuccessEvent)),
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

            jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockImplementation(jest.fn());
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
                    detach: jest.fn(() => Promise.resolve()),
                    getBin: jest.fn(() => 'bin'),
                    getCardType: jest.fn(() => 'cardType'),
                    submit: jest.fn(() => Promise.resolve(mockHostedInputSubmitSuccessEvent)),
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

                jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockImplementation(
                    jest.fn(),
                );
                jest.spyOn(paymentIntegrationService, 'createHostedForm').mockImplementation(
                    jest.fn(),
                );
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
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.reject(threeDSecureRequiredErrorResponse));

            await strategy.initialize(initializeOptions);

            // Mock the message event that would be sent after iframe is created
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 10);

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

            // Mock the message event that would trigger the 3DS flow
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 10);

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

            // Mock the message event that would trigger the 3DS flow
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 10);

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

            // Mock the message event that would trigger the 3DS flow
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 10);

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

            // Mock the message event that would trigger the 3DS flow
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 10);

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
            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.resolve({} as any));

            await strategy.initialize(initializeOptions);

            // Execute the strategy and mock the message event after a short delay
            const promise = strategy.execute(payload);

            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 10);

            await promise;

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        threeDSecure: expect.objectContaining({ token: 'token' }),
                    }),
                }),
            );
        });

        it("stop event execution when the event message string isn't a json", async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            // Execute the strategy and mock the invalid message event after a short delay
            const promise = strategy.execute(payload);

            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: 'invalid string',
                    }),
                );
            }, 10);

            await expect(promise).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message string isn't a valid json with SessionId", async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            // Execute the strategy and mock the invalid message event without SessionId after a short delay
            const promise = strategy.execute(payload);

            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","Status":true}',
                    }),
                );
            }, 10);

            await expect(promise).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message string isn't a valid json with Status", async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            // Execute the strategy and mock the invalid message event without Status after a short delay
            const promise = strategy.execute(payload);

            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token"}',
                    }),
                );
            }, 10);

            await expect(promise).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message isn't string", async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() =>
                Promise.reject(errorResponseAdditionalAction),
            );

            await strategy.initialize(initializeOptions);

            // Mock the non-string message event
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: {},
                    }),
                );
            }, 10);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it('ignores message events from wrong origin', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockImplementationOnce(() => Promise.reject(errorResponseAdditionalAction))
                .mockImplementationOnce(() => Promise.resolve({} as any));

            await strategy.initialize(initializeOptions);

            // Execute the strategy and mock message events from wrong and correct origins
            const promise = strategy.execute(payload);

            // First send a message from wrong origin (should be ignored)
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://malicious-site.com',
                        data: '{"MessageType":"profile.completed","SessionId":"wrong_token","Status":true}',
                    }),
                );
            }, 10);

            // Then send a message from correct origin (should be processed)
            setTimeout(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        origin: 'https://centinelapistag.cardinalcommerce.com',
                        data: '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                    }),
                );
            }, 20);

            await promise;

            // Verify the payment was submitted with the token from the correct origin event
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        threeDSecure: expect.objectContaining({ token: 'token' }),
                    }),
                }),
            );
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
