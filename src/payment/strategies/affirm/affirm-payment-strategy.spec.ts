import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { getBillingAddressState } from '../../../billing/billing-addresses.mock';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { getCheckout, getCheckoutPayment, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutActionType, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { getConsignmentsState } from '../../../shipping/consignments.mock';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import { getAffirm } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';

import AffirmPaymentStrategy from './affirm-payment-strategy';
import { getAffirmScriptMock } from './affirm.mock';
import affirmJS from './affirmJs';

jest.mock('./affirmJs');
declare global { interface Window { affirm: any; } }

describe('AffirmPaymentStrategy', () => {
    let checkoutValidator: CheckoutValidator;
    let initializePaymentAction: Observable<Action>;
    let checkoutRequestSender: CheckoutRequestSender;
    let loadRemoteSettingsAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: AffirmPaymentStrategy;

    beforeEach(() => {
        affirmJS.mockImplementation(() => {
            return {
                default: jest.fn().mockReturnValue(true),
            };
        });
        window.affirm = getAffirmScriptMock();
        window.affirm.checkout.open = jest.fn();
        orderRequestSender = new OrderRequestSender(createRequestSender());
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
            consignments: getConsignmentsState(),
            billingAddress: getBillingAddressState(),
        });
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        strategy = new AffirmPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            remoteCheckoutActionCreator
        );

        paymentMethod = getAffirm();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        initializePaymentAction = of(createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested));
        loadRemoteSettingsAction = of(createAction(
            RemoteCheckoutActionType.LoadRemoteSettingsSucceeded,
            { useStoreCredit: false },
            { methodId: paymentMethod.id }
        ));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(remoteCheckoutActionCreator, 'loadSettings')
            .mockReturnValue(loadRemoteSettingsAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethod);

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });
    });

    describe('#initialize()', () => {
        it('throws an exception if payment method cannot be found', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            const error = 'Unable to proceed because payment method data is unavailable or not properly configured.';
            expect(() => strategy.initialize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway })).toThrowError(error);
        });
    });

    describe('#execute()', () => {
        const successHandler = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });

            strategy.execute(payload).then(successHandler);

            await new Promise(resolve => process.nextTick(resolve));
        });

        it('notifies store credit usage to remote checkout service', () => {
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith( paymentMethod.id, { useStoreCredit: false });
            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
        });

        it('does not resolve if execution is successful', () => {
            expect(successHandler).not.toHaveBeenCalled();
        });

        it('call affirm methods', () => {
            expect(window.affirm.checkout).toHaveBeenCalled();
            expect(window.affirm.checkout.open).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        const nonce = 'bar';

        it('submits the order and the payment', async () => {
            store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
                config: {
                    data: {
                        context: { payment: { token: nonce } },
                    },
                },
                checkout: {
                    data: {
                        ...getCheckout(),
                        payments: [{
                            ...getCheckoutPayment(),
                            providerId: paymentMethod.id,
                            gatewayId: paymentMethod.gateway,
                        }],
                    },
                },
                order: null,
                paymentMethods: getPaymentMethodsState(),
            }));

            strategy = new AffirmPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                remoteCheckoutActionCreator
            );

            jest.spyOn(store, 'dispatch');
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(paymentMethod);

            await strategy.initialize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });
            await strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                { useStoreCredit: false },
                { methodId: paymentMethod.id, gatewayId: paymentMethod.gateway }
            );

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: paymentMethod.id,
                paymentData: { nonce },
            });
        });

        it('throws error if unable to finalize order due to missing data', async () => {
            try {
                await strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

});
