import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../checkout';
import { getCheckout, getCheckoutPayment, getCheckoutStoreState } from '../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../common/error/errors';
import { getGuestCustomer } from '../../customer/internal-customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../order';
import { getIncompleteOrder, getIncompleteOrderState, getOrderRequestBody } from '../../order/internal-orders.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { AfterpayScriptLoader } from '../../remote-checkout/methods/afterpay';
import { INITIALIZE_REMOTE_PAYMENT_FAILED, INITIALIZE_REMOTE_PAYMENT_REQUESTED, LOAD_REMOTE_SETTINGS_SUCCEEDED } from '../../remote-checkout/remote-checkout-action-types';
import PaymentActionCreator from '../payment-action-creator';
import { SUBMIT_PAYMENT_REQUESTED } from '../payment-action-types';
import PaymentMethod from '../payment-method';
import PaymentMethodActionCreator from '../payment-method-action-creator';
import { LOAD_PAYMENT_METHOD_SUCCEEDED } from '../payment-method-action-types';
import { getAfterpay, getPaymentMethodsState } from '../payment-methods.mock';
import PaymentRequestSender from '../payment-request-sender';

import AfterpayPaymentStrategy from './afterpay-payment-strategy';

describe('AfterpayPaymentStrategy', () => {
    let checkoutValidator: CheckoutValidator;
    let checkoutRequestSender: CheckoutRequestSender;
    let client: CheckoutClient;
    let initializePaymentAction: Observable<Action>;
    let loadPaymentMethodAction: Observable<Action>;
    let loadRemoteSettingsAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: AfterpayScriptLoader;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: AfterpayPaymentStrategy;

    const afterpaySdk = {
        initialize: () => {},
        display: () => {},
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodActionCreator = new PaymentMethodActionCreator(client);
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(client, checkoutValidator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new AfterpayScriptLoader(createScriptLoader());
        strategy = new AfterpayPaymentStrategy(
            store,
            checkoutValidator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        paymentMethod = getAfterpay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        initializePaymentAction = Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        loadPaymentMethodAction = Observable.of(createAction(
            LOAD_PAYMENT_METHOD_SUCCEEDED,
            { paymentMethod: { ...paymentMethod, id: 'afterpay' } },
            { methodId: paymentMethod.gateway }
        ));
        loadRemoteSettingsAction = Observable.of(createAction(
            LOAD_REMOTE_SETTINGS_SUCCEEDED,
            { useStoreCredit: false, customerMessage: 'foo' },
            { methodId: paymentMethod.gateway }
        ));
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = Observable.of(createAction(SUBMIT_PAYMENT_REQUESTED));

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        jest.spyOn(store, 'dispatch');

        jest.spyOn(checkoutValidator, 'validate')
            .mockReturnValue(new Promise(resolve => resolve()));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(remoteCheckoutActionCreator, 'loadSettings')
            .mockReturnValue(loadRemoteSettingsAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(scriptLoader, 'load')
            .mockReturnValue(Promise.resolve(afterpaySdk));

        jest.spyOn(afterpaySdk, 'initialize').mockImplementation(() => {});
        jest.spyOn(afterpaySdk, 'display').mockImplementation(() => {});
    });

    describe('#initialize()', () => {
        it('loads script when initializing strategy', async () => {
            await strategy.initialize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });

            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod, 'US');
        });
    });

    describe('#execute()', () => {
        const successHandler = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });

            strategy.execute(payload).then(successHandler);

            await new Promise(resolve => process.nextTick(resolve));
        });

        it('displays the afterpay modal', () => {
            expect(afterpaySdk.initialize).toHaveBeenCalledWith({ countryCode: 'US' });
            expect(afterpaySdk.display).toHaveBeenCalledWith({ token: paymentMethod.clientToken });
        });

        it('notifies store credit usage to remote checkout service', () => {
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith( paymentMethod.gateway, { useStoreCredit: false, customerMessage: '' });
            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
        });

        it('validates the checkout', () => {
            expect(checkoutValidator.validate).toHaveBeenCalled();
        });

        it('does not resolve if execution is successful', () => {
            expect(successHandler).not.toHaveBeenCalled();
        });

        it('rejects with error if execution is unsuccessful', async () => {
            jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
                .mockReturnValue(Observable.of(createErrorAction(INITIALIZE_REMOTE_PAYMENT_FAILED, new Error())));

            const errorHandler = jest.fn();

            strategy.execute(payload).catch(errorHandler);

            await new Promise(resolve => process.nextTick(resolve));

            expect(errorHandler).toHaveBeenCalled();
        });

        it('throws error if trying to execute before initialization', async () => {
            await strategy.deinitialize();

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('loads payment client token', () => {
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(paymentMethod.gateway, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(loadPaymentMethodAction);
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
            }));

            strategy = new AfterpayPaymentStrategy(
                store,
                checkoutValidator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader
            );

            jest.spyOn(store, 'dispatch');

            await strategy.initialize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });
            await strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway });

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                { useStoreCredit: false, customerMessage: 'foo' },
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
