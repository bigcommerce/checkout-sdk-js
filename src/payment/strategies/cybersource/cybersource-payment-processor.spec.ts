import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';

import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getCybersource, getPaymentMethodsState } from '../../payment-methods.mock';
import { getCreditCardInstrument } from '../../payments.mock';

import CyberSourcePaymentProcessor from './cybersource-payment-processor';
import { getCybersourcePaymentRequestBody, getCybersourcePaymentRequestOptions } from './cybersource.mock';

describe('CyberSourcePaymentProcessor', () => {
    let processor: CyberSourcePaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let _paymentActionCreator: PaymentActionCreator;
    let _orderActionCreator: OrderActionCreator;
    let paymentMethodMock: PaymentMethod;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let _orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;

    beforeEach(() => {
        paymentMethodMock = getCybersource();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        _orderRequestSender = new OrderRequestSender(createRequestSender());

        _orderActionCreator = new OrderActionCreator(
            _orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        _paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            _orderActionCreator
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(_orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);
        jest.spyOn(_paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());
        jest.spyOn(store, 'dispatch')
            .mockResolvedValue(store.getState());
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
        requestSender = createRequestSender();

        processor =  new CyberSourcePaymentProcessor(
            store,
            _orderActionCreator,
            _paymentActionCreator
        );

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
            },
        });
    });

    it('creates an instance of CyberSourcePaymentProcessor', () => {
        expect(processor).toBeInstanceOf(CyberSourcePaymentProcessor);
    });

    describe('#initialize', () => {
        it('initializes processor successfully', async () => {
            expect(await processor.initialize(paymentMethodMock)).toEqual(store.getState());
        });
    });

    describe('#execute', () => {
        it('executes the processor successfully', async () => {
            await processor.execute(getCybersourcePaymentRequestBody(), payload, getCreditCardInstrument(), getCybersourcePaymentRequestOptions());

            expect(_orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, getCybersourcePaymentRequestOptions());
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            expect(await processor.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await processor.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
