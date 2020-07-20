import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, noop } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getIncompleteOrder, getOrderRequestBody, getSubmittedOrder } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { InitializeOffsitePaymentAction, PaymentActionType } from '../../payment-actions';
import { getBlueSnapV2 } from '../../payment-methods.mock';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import * as paymentStatusTypes from '../../payment-status-types';
import { getPaymentRequestBody } from '../../payments.mock';

import BlueSnapV2PaymentStrategy from './bluesnapv2-payment-strategy';

describe('BlueSnapV2PaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let initializeOffsitePaymentAction: Observable<InitializeOffsitePaymentAction>;
    let orderActionCreator: OrderActionCreator;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let paymentRequestSender: PaymentRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let initializeOptions: PaymentInitializeOptions;
    let options: PaymentRequestOptions;
    let payload: OrderRequestBody;
    let store: CheckoutStore;
    let strategy: BlueSnapV2PaymentStrategy;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;

    let submitOrderAction: Observable<SubmitOrderAction>;
    let cancelPayment: () => void;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );
        paymentRequestTransformer = new PaymentRequestTransformer();
        paymentRequestSender = new PaymentRequestSender(createPaymentClient());
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            paymentRequestTransformer,
            paymentHumanVerificationHandler
        );
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        initializeOffsitePaymentAction = of(createAction(PaymentActionType.InitializeOffsitePaymentRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        initializeOptions = {
            methodId: 'foobar',
            bluesnapv2: {
                onLoad: (_iframe: HTMLIFrameElement, cancel: () => void) => {
                    cancelPayment = cancel;
                },
            },
        };
        payload = merge(getOrderRequestBody(), {
            payment: {
                methodId: 'foobar',
                paymentData: null,
            },
        });
        options = { methodId: 'foobar' };

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'initializeOffsitePayment')
            .mockReturnValue(initializeOffsitePaymentAction);

        strategy = new BlueSnapV2PaymentStrategy(store, orderActionCreator, paymentActionCreator);
    });

    it('submits order with payment data', async () => {
        await strategy.initialize(initializeOptions);
        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('initializes offsite payment flow', async () => {
        await strategy.initialize(initializeOptions);
        await strategy.execute(payload, options);

        expect(paymentActionCreator.initializeOffsitePayment)
            .toHaveBeenCalledWith({
                methodId: options.methodId,
                gatewayId: options.gatewayId,
                shouldSaveInstrument: false,
                target: 'bluesnapv2_hosted_payment_page',
                promise: expect.any(Promise),
            });
        expect(store.dispatch).toHaveBeenCalledWith(initializeOffsitePaymentAction);
    });

    it('returns cancel error if the user cancels flow', async () => {
        jest.spyOn(paymentActionCreator, 'initializeOffsitePayment')
            .mockRestore();

        jest.spyOn(paymentRequestTransformer, 'transform')
            .mockReturnValue({ ...getPaymentRequestBody(), paymentMethod: getBlueSnapV2() });

        jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
            .mockReturnValue(new Promise(noop));

        await strategy.initialize(initializeOptions);
        const promise = strategy.execute(payload, options);

        await new Promise(resolve => process.nextTick(resolve));
        cancelPayment();

        return expect(promise).rejects.toThrow(PaymentMethodCancelledError);
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

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(getIncompleteOrder());

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('does not finalize order if order is not finalized or acknowledged', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(merge({}, getSubmittedOrder(), {
                payment: {
                    status: paymentStatusTypes.INITIALIZE,
                },
            }));

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('throws error if unable to finalize due to missing data', () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(null);

        return expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
    });

    it('returns checkout state', async () => {
        await strategy.initialize(initializeOptions);

        return expect(strategy.execute(payload, options)).resolves.toEqual(store.getState());
    });
});
