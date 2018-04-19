import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/internal-billing-addresses.mock';
import { getCart } from '../../../cart/internal-carts.mock';
import { createCheckoutClient, CheckoutSelector, CheckoutStore } from '../../../checkout';
import { MissingDataError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../../order/order-action-types';
import Payment, { CreditCard, VaultedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { SUBMIT_PAYMENT_REQUESTED } from '../../payment-action-types';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getBraintree } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';

import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import BraintreePaymentProcessor, { BraintreeCreditCardInitializeOptions } from './braintree-payment-processor';

describe('BraintreeCreditCardPaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let braintreePaymentProcessorMock: BraintreePaymentProcessor;
    let braintreeCreditCardPaymentStrategy: BraintreeCreditCardPaymentStrategy;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let checkoutMock: CheckoutSelector;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        braintreePaymentProcessorMock = {} as BraintreePaymentProcessor;
        braintreePaymentProcessorMock.initialize = jest.fn();
        braintreePaymentProcessorMock.tokenizeCard = jest.fn(() => Promise.resolve({ nonce: 'my_tokenized_card' }));
        braintreePaymentProcessorMock.verifyCard = jest.fn(() => Promise.resolve({ nonce: 'my_verified_card' }));
        braintreePaymentProcessorMock.appendSessionId = jest.fn(tokenizedCard => tokenizedCard.then(card => ({ ...card, deviceSessionId: 'my_session_id' })));
        braintreePaymentProcessorMock.deinitialize = jest.fn();

        paymentMethodMock = { ...getBraintree(), clientToken: 'myToken' };

        checkoutMock = {} as CheckoutSelector;
        checkoutMock.isPaymentDataRequired = jest.fn((useStoreCredit: boolean) => true);

        store = {} as CheckoutStore;
        store.dispatch = jest.fn(() => Promise.resolve({ checkout: checkoutMock }));
        store.getState = jest.fn(() => ({ checkout: checkoutMock }));

        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());

        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));
        submitPaymentAction = Observable.of(createAction(SUBMIT_PAYMENT_REQUESTED));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

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
            checkoutMock.getPaymentMethod = jest.fn(() => ({ ...getBraintree(), clientToken: 'myToken' }));
            const options = {} as BraintreeCreditCardInitializeOptions;
            options.paymentMethod = getBraintree();
            await braintreeCreditCardPaymentStrategy.initialize(options);
            expect(braintreePaymentProcessorMock.initialize).toHaveBeenCalledWith('myToken', options);
        });

        it('throws error if client token is missing', async () => {
            const paymentMethod = { ...getBraintree(), clientToken: '' };

            checkoutMock.getPaymentMethod = jest.fn(() => paymentMethod);

            try {
                await braintreeCreditCardPaymentStrategy.initialize({ paymentMethod });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let options: BraintreeCreditCardInitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            options = { paymentMethod: getBraintree() };
            checkoutMock.getCart = jest.fn(() => getCart());
            checkoutMock.getBillingAddress = jest.fn(() => getBillingAddress());
            checkoutMock.getPaymentMethod = jest.fn(() => paymentMethodMock);
        });

        it('calls submit order with the order request information', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), expect.any(Boolean), expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('asks for cart verification', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), true, expect.any(Object));
        });

        it('pass the options to submitOrder', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), options);
        });

        it('does not touch the card if it is going to be saved in the vault (shouldSaveInstrument: true)', async () => {
            const paymentData = orderRequestBody.payment.paymentData as CreditCard;

            paymentData.shouldSaveInstrument = true;
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalledWith(orderRequestBody.payment);
        });

        it('does nothing to VaultedInstruments', async () => {
            const vaultedInstrument = { instrumentId: 'my_instrument_id' } as VaultedInstrument;
            orderRequestBody.payment.paymentData = vaultedInstrument;

            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalledWith(orderRequestBody.payment);
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
            const options3ds = {} as BraintreeCreditCardInitializeOptions;
            options3ds.paymentMethod = paymentMethodMock;
            options3ds.paymentMethod.config.is3dsEnabled = true;
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

        it('throws error if unable to submit payment due to missing data', async () => {
            checkoutMock.getCart = jest.fn(() => undefined);
            checkoutMock.getBillingAddress = jest.fn(() => undefined);

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
            await braintreeCreditCardPaymentStrategy.deinitialize({});
            expect(braintreePaymentProcessorMock.deinitialize).toHaveBeenCalled();
        });
    });
});
