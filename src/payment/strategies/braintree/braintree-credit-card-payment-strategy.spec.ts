import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { from, of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { Order, OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getBraintree } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import BraintreePaymentProcessor from './braintree-payment-processor';

describe('BraintreeCreditCardPaymentStrategy', () => {
    let order: Order;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let braintreePaymentProcessorMock: BraintreePaymentProcessor;
    let braintreeCreditCardPaymentStrategy: BraintreeCreditCardPaymentStrategy;
    let loadPaymentMethodAction: Observable<Action>;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        braintreePaymentProcessorMock = {} as BraintreePaymentProcessor;
        braintreePaymentProcessorMock.initialize = jest.fn();
        braintreePaymentProcessorMock.tokenizeCard = jest.fn(() => Promise.resolve({ nonce: 'my_tokenized_card' }));
        braintreePaymentProcessorMock.verifyCard = jest.fn(() => Promise.resolve({ nonce: 'my_verified_card' }));
        braintreePaymentProcessorMock.appendSessionId = jest.fn(tokenizedCard => tokenizedCard.then((card: any) => ({ ...card, deviceSessionId: 'my_session_id' })));
        braintreePaymentProcessorMock.deinitialize = jest.fn();

        paymentMethodMock = { ...getBraintree(), clientToken: 'myToken' };

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
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));

        order = getOrder();
        submitOrderAction = from([
            createAction(OrderActionType.SubmitOrderRequested),
            createAction(OrderActionType.LoadOrderSucceeded, order), // Currently we load the order after a successful submission
        ]);
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: paymentMethodMock.id }));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        braintreeCreditCardPaymentStrategy = new BraintreeCreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessorMock
        );
    });

    it('creates an instance of the braintree payment strategy', () => {
        expect(braintreeCreditCardPaymentStrategy).toBeInstanceOf(BraintreeCreditCardPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the braintree payment processor with the client token and the set of options', async () => {
            const options = { braintree: {}, methodId: paymentMethodMock.id };

            await braintreeCreditCardPaymentStrategy.initialize(options);

            expect(braintreePaymentProcessorMock.initialize).toHaveBeenCalledWith('myToken', options.braintree);
        });

        it('throws error if client token is missing', async () => {
            paymentMethodMock.clientToken = '';

            try {
                await braintreeCreditCardPaymentStrategy.initialize({ methodId: paymentMethodMock.id });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            options = { methodId: paymentMethodMock.id };
        });

        it('calls submit order with the order request information', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('pass the options to submitOrder', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), options);
        });

        it('does not touch the card if it is going to be saved in the vault (shouldSaveInstrument: true)', async () => {
            const payload = merge({}, orderRequestBody, {
                payment: { paymentData: { shouldSaveInstrument: true } },
            });

            await braintreeCreditCardPaymentStrategy.execute(payload, options);

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalledWith(payload.payment);
        });

        it('does nothing to VaultedInstruments', async () => {
            const payload = {
                ...orderRequestBody,
                payment: {
                    methodId: 'braintree',
                    paymentData: {
                        instrumentId: 'my_instrument_id',
                        iin: '123123',
                    },
                },
            };

            await braintreeCreditCardPaymentStrategy.execute(payload, options);

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalledWith(payload.payment);
        });

        it('tokenizes the card', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: { deviceSessionId: 'my_session_id', nonce: 'my_tokenized_card' },
            };

            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.tokenizeCard).toHaveBeenCalledWith(orderRequestBody.payment, getBillingAddress());
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('verifies the card if 3ds is enabled', async () => {
            const options3ds = { methodId: paymentMethodMock.id };

            paymentMethodMock.config.is3dsEnabled = true;

            await braintreeCreditCardPaymentStrategy.initialize(options3ds);

            const expected = {
                ...orderRequestBody.payment,
                paymentData: { deviceSessionId: 'my_session_id', nonce: 'my_verified_card' },
            };

            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.verifyCard).toHaveBeenCalledWith(orderRequestBody.payment, getBillingAddress(), 190);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('passes the order amount to 3ds client', async () => {
            order.orderAmount = 123;
            paymentMethodMock.config.is3dsEnabled = true;

            await braintreeCreditCardPaymentStrategy.initialize({ methodId: paymentMethodMock.id });
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.verifyCard).toHaveBeenCalledWith(
                orderRequestBody.payment,
                order.billingAddress,
                order.orderAmount
            );
        });

        it('throws error if unable to submit payment due to missing data', async () => {
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

            jest.spyOn(orderActionCreator, 'submitOrder')
                .mockReturnValue(submitOrderAction);

            braintreeCreditCardPaymentStrategy = new BraintreeCreditCardPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessorMock
            );

            try {
                await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#deinitialize()', () => {
        it('calls deinitialize in the braintree payment processor', async () => {
            braintreePaymentProcessorMock.deinitialize = jest.fn(() => Promise.resolve());

            await braintreeCreditCardPaymentStrategy.deinitialize();

            expect(braintreePaymentProcessorMock.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await braintreeCreditCardPaymentStrategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
