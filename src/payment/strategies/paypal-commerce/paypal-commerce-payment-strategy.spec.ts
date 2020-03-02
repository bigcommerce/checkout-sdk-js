import { createAction, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import { PaymentMethodActionType } from '../../payment-method-actions';
import { getPaypalCommerce } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import PaypalCommercePaymentStrategy from './paypal-commerce-payment-strategy';

describe('PaypalCommercePaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paypalCommercePaymentStrategy: PaymentStrategy;
    let paymentMethod: PaymentMethod;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let options: PaymentInitializeOptions;

    beforeEach(() => {
        paymentMethod = { ...getPaypalCommerce() };
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        store = createCheckoutStore(getCheckoutStoreState());
        options = { methodId: paymentMethod.id };

        jest.spyOn(store, 'dispatch');

        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);

        paypalCommercePaymentStrategy = new PaypalCommercePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        );
    });

    describe('#initialize()', () => {
        it('returns checkout state', async () => {
            const output = await paypalCommercePaymentStrategy.initialize(options);

            expect(output).toEqual(store.getState());
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
        });

        it('pass the options to submitOrder', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), options);
        });

        it('calls submit order', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        device_info: null,
                        paypal_account: {
                            order_id: paymentMethod.initializationData.orderId,
                        },
                    },
                },
            };

            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('calls submit payment', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('throw error without payment data', async () => {
            orderRequestBody.payment = undefined;

            await paypalCommercePaymentStrategy.initialize(options);

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new PaymentArgumentInvalidError(['payment']));
            }
        });

        it('throw error with mistake in methodId', async () => {
            options.methodId = '';
            await paypalCommercePaymentStrategy.initialize(options);

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }
        });

        it('throw error without orderId (paypal) in paymentMethod', async () => {
            paymentMethod.initializationData.orderId = null;

            await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

            await paypalCommercePaymentStrategy.initialize(options);

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }
        });
    });
});
