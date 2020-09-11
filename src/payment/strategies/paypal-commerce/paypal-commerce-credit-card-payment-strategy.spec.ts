import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getPaypalCommerce } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { PaypalCommerceCreditCardPaymentStrategy, PaypalCommerceFormOptions, PaypalCommerceHostedForm, PaypalCommercePaymentProcessor, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK } from './index';
import { getPaypalCommerceMock } from './paypal-commerce.mock';

describe('PaypalCommercePaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentStrategy: PaypalCommerceCreditCardPaymentStrategy;
    let paymentMethod: PaymentMethod;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let options: PaymentInitializeOptions;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let paypal: PaypalCommerceSDK;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paypalCommerceHostedForm: PaypalCommerceHostedForm;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let orderId: string;

    beforeEach(() => {
        const requestSender = createRequestSender();

        paymentMethod = {...getPaypalCommerce()};
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(paypalScriptLoader, new PaypalCommerceRequestSender(requestSender));
        paypalCommerceHostedForm = new PaypalCommerceHostedForm(paypalCommercePaymentProcessor);

        orderId = 'orderId';

        store = createCheckoutStore(getCheckoutStoreState());
        options = {
            methodId: paymentMethod.id,
            paypalcommerce: { form: {} as PaypalCommerceFormOptions },
        };

        jest.spyOn(store, 'dispatch');

        paypal = getPaypalCommerceMock();

        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockReturnValue(Promise.resolve(paypal));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod, { methodId: paymentMethod.id })));

        paypalCommerceHostedForm.initialize = jest.fn();
        paypalCommerceHostedForm.submit = jest.fn(() => ({ orderId }));

        paymentStrategy = new PaypalCommerceCreditCardPaymentStrategy(
            store,
            paymentMethodActionCreator,
            paypalCommerceHostedForm,
            orderActionCreator,
            paymentActionCreator
        );
    });

    it('creates an instance of the paypal commerce credit card payment strategy', () => {
        expect(paymentStrategy).toBeInstanceOf(PaypalCommerceCreditCardPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initialize hosted form', async () => {
            await paymentStrategy.initialize(options);

            expect(paypalCommerceHostedForm.initialize).toHaveBeenCalled();
        });

        it('throw error without form in options', async () => {
            try {
                await paymentStrategy.initialize({ methodId: 'paypalcommerce' });
            } catch (error) {
               expect(error).toEqual(new InvalidArgumentError('Unable to proceed because "options.paypalcommerce.form" argument is not provided.'));
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
        });

        it('pass the options to submitOrder', async () => {
            await paymentStrategy.initialize(options);
            await paymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), options);
        });

        it('calls submit order', async () => {
            await paymentStrategy.initialize(options);
            await paymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        paypal_account: {
                            order_id: orderId,
                        },
                    },
                },
            };

            await paymentStrategy.initialize(options);
            await paymentStrategy.execute(orderRequestBody, options);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('calls submit payment', async () => {
            await paymentStrategy.initialize(options);
            await paymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('calls submit hosted form', async () => {
            await paymentStrategy.initialize(options);
            await paymentStrategy.execute(orderRequestBody, options);

            expect(paypalCommerceHostedForm.submit).toHaveBeenCalled();
        });

        it('throw error without payment data', async () => {
            orderRequestBody.payment = undefined;

            await paymentStrategy.initialize(options);

            try {
                await paymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new PaymentArgumentInvalidError(['payment']));
            }
        });
    });
});
