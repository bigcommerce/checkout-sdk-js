import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getIncompleteOrder, getOrderRequestBody, getSubmittedOrder } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { InitializeOffsitePaymentAction, PaymentActionType } from '../../payment-actions';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import * as paymentStatusTypes from '../../payment-status-types';

import OffsitePaymentStrategy from './offsite-payment-strategy';

describe('OffsitePaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let initializeOffsitePaymentAction: Observable<InitializeOffsitePaymentAction>;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let options: PaymentRequestOptions;
    let payload: OrderRequestBody;
    let store: CheckoutStore;
    let strategy: OffsitePaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()))
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        initializeOffsitePaymentAction = of(createAction(PaymentActionType.InitializeOffsitePaymentRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        options = { methodId: 'foobar' };
        payload = merge(getOrderRequestBody(), {
            payment: {
                methodId: options.methodId,
                paymentData: null,
            },
        });

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
        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits order with payment data if payment gateway is "adyen"', async () => {
        options = { methodId: 'amex', gatewayId: 'adyen' };
        payload = {
            ...payload,
            payment: { methodId: options.methodId, gatewayId: options.gatewayId },
        };

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits order with payment data if payment method is "ccavenuemars"', async () => {
        options = { methodId: 'ccavenuemars' };
        payload = {
            ...payload,
            payment: { methodId: options.methodId, gatewayId: options.gatewayId },
        };

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('initializes offsite payment flow', async () => {
        await strategy.execute(payload, options);

        expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalledWith(options.methodId, options.gatewayId);
        expect(store.dispatch).toHaveBeenCalledWith(initializeOffsitePaymentAction);
    });

    it('finalizes order if order is created and payment is acknowledged', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(getOrder());

        jest.spyOn(state.payment, 'getPaymentStatus')
            .mockReturnValue(paymentStatusTypes.ACKNOWLEDGE);

        await strategy.finalize(options);

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(getOrder().orderId, options);
        expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(getOrder());

        jest.spyOn(state.payment, 'getPaymentStatus')
            .mockReturnValue(paymentStatusTypes.FINALIZE);

        await strategy.finalize(options);

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(getOrder().orderId, options);
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
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(null);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
