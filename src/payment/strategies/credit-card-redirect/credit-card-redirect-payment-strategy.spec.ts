import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { HostedFieldType, HostedForm, HostedFormFactory } from '../../../hosted-form';
import { FinalizeOrderAction, LoadOrderSucceededAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getPaymentMethod } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import * as paymentStatusTypes from '../../payment-status-types';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import CreditCardRedirectPaymentStrategy from './credit-card-redirect-payment-strategy';

describe('CreditCardRedirectPaymentStrategy', () => {
    let formFactory: HostedFormFactory;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let orderRequestSender: OrderRequestSender;
    let strategy: CreditCardRedirectPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        formFactory = new HostedFormFactory(store);
        requestSender = createRequestSender();
        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        formPoster = createFormPoster();
        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation((_url, _data, callback = () => {}) => callback());

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new CreditCardRedirectPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formFactory,
            formPoster
        );
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'methodId' };

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'methodId' };

        await strategy.execute(payload, options);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });

    it('posts 3ds data to the provided acs_url if 3ds is enabled', async () => {
        const error = new RequestError(getResponse({
            ...getErrorPaymentResponseBody(),
            errors: [
                { code: 'three_d_secure_required' },
            ],
            three_ds_result: {
                acs_url: 'https://acs/url',
                callback_url: 'https://callback/url',
                payer_auth_request: 'payer_auth_request',
                merchant_data: 'merchant_data',
            },
            status: 'error',
        }));

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

        strategy.execute(getOrderRequestBody());

        await new Promise(resolve => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
            PaReq: 'payer_auth_request',
            TermUrl: 'https://callback/url',
            MD: 'merchant_data',
        });
    });

    it('does not post 3ds data to the provided acs_url if 3ds is not enabled', async () => {
        const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, response)));

        await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(RequestError);
        expect(formPoster.postForm).not.toHaveBeenCalled();
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(getOrder());

        jest.spyOn(state.payment, 'getPaymentStatus')
            .mockReturnValue(paymentStatusTypes.FINALIZE);

        await strategy.finalize();

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('does not finalize order if order is not created', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(null);

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('does not finalize order if order is not finalized', async () => {
        const state = store.getState();

        jest.spyOn(state.payment, 'getPaymentStatus')
            .mockReturnValue(paymentStatusTypes.INITIALIZE);

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('throws error if order is missing', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(null);

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
    });

    describe('when hosted form is enabled', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
        let initializeOptions: PaymentInitializeOptions;
        let loadOrderAction: Observable<LoadOrderSucceededAction>;
        let state: InternalCheckoutSelectors;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
            };
            initializeOptions = {
                creditCard: {
                    form: {
                        fields: {
                            [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                            [HostedFieldType.CardName]: { containerId: 'card-name' },
                            [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                        },
                    },
                },
                methodId: 'checkoutcom',
            };
            loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));
            state = store.getState();

            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(merge(
                    getPaymentMethod(),
                    { config: { isHostedFormEnabled: true } }
                ));

            jest.spyOn(orderActionCreator, 'loadCurrentOrder')
                .mockReturnValue(loadOrderAction);

            jest.spyOn(formFactory, 'create')
                .mockReturnValue(form);
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(formFactory.create)
                .toHaveBeenCalledWith(
                    'https://bigpay.integration.zone',
                    // tslint:disable-next-line:no-non-null-assertion
                    initializeOptions.creditCard!.form!
                );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach)
                .toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit)
                .toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(form.validate)
                .toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate')
                .mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(form.submit)
                    .not.toHaveBeenCalled();
            }
        });

        it('loads current order after payment submission', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(store.dispatch)
                .toHaveBeenCalledWith(loadOrderAction);
        });

        it('posts 3ds data to the provided acs_url if 3ds is enabled', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                    callback_url: 'https://callback/url',
                    payer_auth_request: 'payer_auth_request',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }));

            jest.spyOn(form, 'submit')
                .mockRejectedValue(error);

            await strategy.initialize(initializeOptions);
            strategy.execute(getOrderRequestBody());

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url',
            {
                PaReq: 'payer_auth_request',
                TermUrl: 'https://callback/url',
                MD: 'merchant_data',
            });
            expect(orderActionCreator.loadCurrentOrder)
                .not.toHaveBeenCalled();
        });
    });
});
