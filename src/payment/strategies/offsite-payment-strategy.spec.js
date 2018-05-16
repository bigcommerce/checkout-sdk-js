import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { merge, omit } from 'lodash';

import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { getOrderRequestBody, getIncompleteOrder, getSubmittedOrder } from '../../order/internal-orders.mock';
import { OrderActionCreator, OrderActionType } from '../../order';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import PaymentActionCreator from '../payment-action-creator';
import { INITIALIZE_OFFSITE_PAYMENT_REQUESTED } from '../payment-action-types';
import PaymentRequestSender from '../payment-request-sender';
import * as paymentStatusTypes from '../payment-status-types';

import OffsitePaymentStrategy from './offsite-payment-strategy';

describe('OffsitePaymentStrategy', () => {
    let finalizeOrderAction;
    let initializeOffsitePaymentAction;
    let orderActionCreator;
    let paymentActionCreator;
    let store;
    let strategy;
    let submitOrderAction;

    beforeEach(() => {
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );
        finalizeOrderAction = Observable.of(createAction(OrderActionType.FinalizeOrderRequested));
        initializeOffsitePaymentAction = Observable.of(createAction(INITIALIZE_OFFSITE_PAYMENT_REQUESTED));
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'initializeOffsitePayment')
            .mockReturnValue(initializeOffsitePaymentAction);

        strategy = new OffsitePaymentStrategy(store, orderActionCreator, paymentActionCreator);
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits order with payment data if payment gateway is "adyen"', async () => {
        const payload = merge({}, getOrderRequestBody(), {
            payment: { name: 'amex', gateway: 'adyen' },
        });
        const options = {};

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('initializes offsite payment flow', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalledWith(payload.payment);
        expect(store.dispatch).toHaveBeenCalledWith(initializeOffsitePaymentAction);
    });

    it('finalizes order if order is created and payment is acknowledged', async () => {
        const state = store.getState();
        const options = {};

        jest.spyOn(state.order, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.ACKNOWLEDGE,
            },
        }));

        await strategy.finalize(options);

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(state.order.getOrder().orderId, options);
        expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const state = store.getState();
        const options = {};

        jest.spyOn(state.order, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.FINALIZE,
            },
        }));

        await strategy.finalize(options);

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(state.order.getOrder().orderId, options);
        expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('does not finalize order if order is not created', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder').mockReturnValue(getIncompleteOrder());

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
        }
    });

    it('does not finalize order if order is not finalized or acknowledged', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.INITIALIZE,
            },
        }));

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
        }
    });

    it('throws error if unable to finalize due to missing data', async () => {
        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
