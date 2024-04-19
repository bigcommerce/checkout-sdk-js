import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCartState } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getPaymentMethodsState, getSquare } from '../../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import SquareCustomerStrategy from './square-customer-strategy';

describe('SquareCustomerStrategy', () => {
    let checkoutActionCreator: CheckoutActionCreator;
    let container: HTMLDivElement;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;

    beforeEach(() => {
        paymentMethodMock = { ...getSquare() };

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );

        requestSender = createRequestSender();
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator,
        );

        strategy = new SquareCustomerStrategy(store, remoteCheckoutActionCreator);

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of SquareCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(SquareCustomerStrategy);
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
        });
    });

    describe('#signOut()', () => {
        beforeEach(() => {
            const paymentId = {
                providerId: 'squarev2',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut').mockReturnValue('data');
        });

        it('throws error if trying to sign out programmatically', async () => {
            const options = {
                methodId: 'squarev2',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('squarev2', options);
            expect(store.dispatch).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback: mockCallback,
            });

            expect(mockCallback.mock.calls).toHaveLength(1);
        });
    });
});
