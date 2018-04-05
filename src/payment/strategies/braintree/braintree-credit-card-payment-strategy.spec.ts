import { omit } from 'lodash';

import { getBillingAddress } from '../../../billing/internal-billing-addresses.mock';
import { getCart } from '../../../cart/internal-carts.mock';
import { CheckoutSelector, CheckoutStore } from '../../../checkout';
import { OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PlaceOrderService from '../../../order/place-order-service';
import Payment, { CreditCard, VaultedInstrument } from '../../payment';
import PaymentMethod from '../../payment-method';
import { getBraintree } from '../../payment-methods.mock';

import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import BraintreePaymentProcessor, { BraintreeCreditCardInitializeOptions } from './braintree-payment-processor';

describe('BraintreeCreditCardPaymentStrategy', () => {
    let placeOrderService: PlaceOrderService;
    let braintreePaymentProcessorMock: BraintreePaymentProcessor;
    let braintreeCreditCardPaymentStrategy: BraintreeCreditCardPaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let checkoutMock: CheckoutSelector;

    beforeEach(() => {
        braintreePaymentProcessorMock = {} as BraintreePaymentProcessor;
        braintreePaymentProcessorMock.initialize = jest.fn();
        braintreePaymentProcessorMock.tokenizeCard = jest.fn(() => Promise.resolve({ nonce: 'my_tokenized_card' }));
        braintreePaymentProcessorMock.verifyCard = jest.fn(() => Promise.resolve({ nonce: 'my_verified_card' }));
        braintreePaymentProcessorMock.appendSessionId = jest.fn((tokenizedCard) => tokenizedCard.then((card) => ({ ...card, deviceSessionId: 'my_session_id' })));
        braintreePaymentProcessorMock.deinitialize = jest.fn();

        paymentMethodMock = { ...getBraintree(), clientToken: 'myToken' };

        checkoutMock = {} as CheckoutSelector;
        checkoutMock.isPaymentDataRequired = jest.fn((useStoreCredit: boolean) => true);
        const store = {} as CheckoutStore;
        store.getState = jest.fn(() => ({ checkout: checkoutMock }));

        placeOrderService = {} as PlaceOrderService;
        placeOrderService.submitPayment = jest.fn(() => Promise.resolve());
        placeOrderService.submitOrder = jest.fn(() => Promise.resolve());
        placeOrderService.verifyCart = jest.fn(() => Promise.resolve());
        placeOrderService.loadPaymentMethod = jest.fn(() => Promise.resolve(store.getState()));

        braintreeCreditCardPaymentStrategy = new BraintreeCreditCardPaymentStrategy(store, placeOrderService, braintreePaymentProcessorMock);
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
            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), expect.any(Boolean), expect.any(Object));
        });

        it('asks for cart verification', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);
            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(expect.any(Object), true, expect.any(Object));
        });

        it('pass the options to submitOrder', async () => {
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);
            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), options);
        });

        it('does not touch the card if it is going to be saved in the vault (shouldSaveInstrument: true)', async () => {
            const paymentData = orderRequestBody.payment.paymentData as CreditCard;

            paymentData.shouldSaveInstrument = true;
            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(orderRequestBody.payment, false, options);
        });

        it('does nothing to VaultedInstruments', async () => {
            const vaultedInstrument = { instrumentId: 'my_instrument_id' } as VaultedInstrument;
            orderRequestBody.payment.paymentData = vaultedInstrument;

            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(orderRequestBody.payment, false, options);
        });

        it('flags the use of store credit to PlaceOrderService', async () => {
            orderRequestBody.useStoreCredit = true;

            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(expect.any(Object), true, expect.any(Object));
        });

        it('tokenizes the card', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: { deviceSessionId: 'my_session_id', nonce: 'my_tokenized_card' },
            };

            await braintreeCreditCardPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.tokenizeCard).toHaveBeenCalledWith(orderRequestBody.payment, getBillingAddress());
            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(expected, false, options);
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
            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(expected, false, options);
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
