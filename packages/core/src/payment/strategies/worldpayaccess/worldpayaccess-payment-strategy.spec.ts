import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
    InternalCheckoutSelectors,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { HostedFieldType, HostedForm, HostedFormFactory } from '../../../hosted-form';
import {
    LoadOrderSucceededAction,
    OrderActionCreator,
    OrderActionType,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import { getPaymentMethod } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import WorldpayaccessPaymetStrategy from './worldpayaccess-payment-strategy';

describe('WorldpayaccessPaymetStrategy', () => {
    let formFactory: HostedFormFactory;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let store: CheckoutStore;
    let strategy: WorldpayaccessPaymetStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let initializeOptions: PaymentInitializeOptions;
    let state: InternalCheckoutSelectors;

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
        store = createCheckoutStore(getCheckoutStoreState());
        state = store.getState();

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
        );

        formFactory = new HostedFormFactory(store);

        strategy = new WorldpayaccessPaymetStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formFactory,
        );

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }),
        );

        HTMLFormElement.prototype.submit = () =>
            window.parent.postMessage(
                '{"MessageType":"profile.completed","SessionId":"token","Status":true}',
                '*',
            );
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

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
            omit(payload, 'payment'),
            undefined,
        );
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        await strategy.execute(payload);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(payload);

        expect(output).toEqual(store.getState());
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

            jest.spyOn(orderActionCreator, 'loadCurrentOrder').mockReturnValue(loadOrderAction);

            jest.spyOn(formFactory, 'create').mockReturnValue(form);
        });

        it('throws error when HostedForm.submit is missing', async () => {
            const form: Pick<HostedForm, 'attach' | 'validate'> = {
                attach: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
            };

            jest.spyOn(formFactory, 'create').mockReturnValue(form);

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(formFactory.create).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                // tslint:disable-next-line:no-non-null-assertion
                initializeOptions.creditCard!.form,
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

        it('loads current order after payment submission', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(store.dispatch).toHaveBeenCalledWith(loadOrderAction);
        });

        it('submit with collection data required hosted', async () => {
            jest.spyOn(orderActionCreator, 'loadCurrentOrder').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
            );

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(orderActionCreator.loadCurrentOrder).toHaveBeenCalled();
            expect(form.submit).toHaveBeenCalledTimes(2);
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

                jest.spyOn(orderActionCreator, 'loadCurrentOrder').mockReturnValue(loadOrderAction);

                jest.spyOn(formFactory, 'create').mockReturnValue(form);
            });

            it('does not create hosted form', async () => {
                await strategy.initialize(initializeOptions);

                expect(formFactory.create).not.toHaveBeenCalled();
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

            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
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

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            errorResponseAdditionalAction,
                        ),
                    ),
                )
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            threeDSecureRequiredErrorResponse,
                        ),
                    ),
                );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(RequestError);
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

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            errorResponseAdditionalAction,
                        ),
                    ),
                )
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            threeDSecureRequiredErrorResponse,
                        ),
                    ),
                );

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
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            errorResponseAdditionalAction,
                        ),
                    ),
                )
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            threeDSecureRequiredErrorResponse,
                        ),
                    ),
                );

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

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            errorResponseAdditionalAction,
                        ),
                    ),
                )
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            threeDSecureRequiredErrorResponse,
                        ),
                    ),
                );

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

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            errorResponseAdditionalAction,
                        ),
                    ),
                )
                .mockReturnValueOnce(
                    of(
                        createErrorAction(
                            PaymentActionType.SubmitPaymentFailed,
                            threeDSecureRequiredErrorResponse,
                        ),
                    ),
                );

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

            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                merge(getPaymentMethod(), { config: { isHostedFormEnabled: false } }),
            );
        });

        it('submit with collection data required', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
            );

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
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

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message string isn't a valid json with SessionId", async () => {
            HTMLFormElement.prototype.submit = () =>
                window.parent.postMessage('{"MessageType":"profile.completed","Status":true}', '*');

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("stop event execution when the event message isn't string", async () => {
            HTMLFormElement.prototype.submit = () => window.parent.postMessage({}, '*');

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);
        });

        it("throws error when hidden iframe isn't created", async () => {
            const createElement = window.document.createElement;

            window.document.createElement = jest.fn().mockImplementationOnce(() => {
                return undefined;
            });

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
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

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        errorResponseAdditionalAction,
                    ),
                ),
            );

            await strategy.initialize(initializeOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PAYMENT_CANNOT_CONTINUE);

            window.document.body.appendChild = append;
        });
    });
});
