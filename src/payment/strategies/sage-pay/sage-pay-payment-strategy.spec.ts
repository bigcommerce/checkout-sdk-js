import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { HostedFormFactory } from '../../../hosted-form';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import * as paymentStatusTypes from '../../payment-status-types';
import { getErrorPaymentResponseBody } from '../../payments.mock';
import { CreditCardPaymentStrategy } from '../credit-card';

import SagePayPaymentStrategy from './sage-pay-payment-strategy';

describe('SagePayPaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let hostedFormFactory: HostedFormFactory;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let store: CheckoutStore;
    let orderRequestSender: OrderRequestSender;
    let strategy: SagePayPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        orderRequestSender = new OrderRequestSender(createRequestSender());
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );

        formPoster = createFormPoster();
        hostedFormFactory = new HostedFormFactory(store);
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

        strategy = new SagePayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
            formPoster
        );
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'sagepay' };

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'sagepay' };

        await strategy.execute(payload, options);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });

    it('posts 3ds data to Sage if 3ds is enabled', async () => {
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
        }, undefined, '_top');
    });

    it('does not post 3ds data to Sage if 3ds is not enabled', async () => {
        const respons = new RequestError(getResponse(getErrorPaymentResponseBody()));

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, respons)));

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(formPoster.postForm).not.toHaveBeenCalled();
        }
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

        try {
            await strategy.finalize();
        } catch (error) {
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('does not finalize order if order is not finalized', async () => {
        const state = store.getState();

        jest.spyOn(state.payment, 'getPaymentStatus')
            .mockReturnValue(paymentStatusTypes.INITIALIZE);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('throws error if order is missing', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(null);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('is special type of credit card strategy', () => {
        expect(strategy)
            .toBeInstanceOf(CreditCardPaymentStrategy);
    });
});
