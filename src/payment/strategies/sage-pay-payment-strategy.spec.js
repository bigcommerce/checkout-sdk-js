import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { merge, omit } from 'lodash';

import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { MissingDataError, RequestError } from '../../common/error/errors';
import { getResponse } from '../../common/http-request/responses.mock';
import { getOrderRequestBody, getIncompleteOrder, getSubmittedOrder } from '../../order/internal-orders.mock';
import { OrderActionCreator, OrderActionType } from '../../order';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import * as paymentStatusTypes from '../payment-status-types';
import PaymentActionCreator from '../payment-action-creator';
import PaymentRequestSender from '../payment-request-sender';
import { SUBMIT_PAYMENT_REQUESTED, SUBMIT_PAYMENT_FAILED } from '../payment-action-types';
import { getErrorPaymentResponseBody } from '../payments.mock';

import SagePayPaymentStrategy from './sage-pay-payment-strategy';

describe('SagePayPaymentStrategy', () => {
    let finalizeOrderAction;
    let formPoster;
    let orderActionCreator;
    let paymentActionCreator;
    let store;
    let strategy;
    let submitOrderAction;
    let submitPaymentAction;

    beforeEach(() => {
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );

        formPoster = {
            postForm: jest.fn((url, data, callback = () => {}) => callback()),
        };

        store = createCheckoutStore();

        finalizeOrderAction = Observable.of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = Observable.of(createAction(SUBMIT_PAYMENT_REQUESTED));

        jest.spyOn(store, 'dispatch');

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
            formPoster
        );
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();
        const options = {};

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
            .mockReturnValue(Observable.of(createErrorAction(SUBMIT_PAYMENT_FAILED, error)));

        strategy.execute(getOrderRequestBody());

        await new Promise((resolve) => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
            PaReq: 'payer_auth_request',
            TermUrl: 'https://callback/url',
            MD: 'merchant_data',
        });
    });

    it('does not post 3ds data to Sage if 3ds is not enabled', async () => {
        const respons = new RequestError(getResponse(getErrorPaymentResponseBody()));

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(Observable.of(createErrorAction(SUBMIT_PAYMENT_FAILED, respons)));

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(formPoster.postForm).not.toHaveBeenCalled();
        }
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.FINALIZE,
            },
        }));

        await strategy.finalize();

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('does not finalize order if order is not created', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder').mockReturnValue(getIncompleteOrder());

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

        jest.spyOn(state.order, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.INITIALIZE,
            },
        }));

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

        jest.spyOn(state.order, 'getOrder').mockReturnValue();

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });
});
