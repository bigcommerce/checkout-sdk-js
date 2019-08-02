import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutPayment, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { RemoteCheckoutActionCreator, RemoteCheckoutActionType, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getAfterpay } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import AfterpayPaymentStrategy from './afterpay-payment-strategy';
import AfterpayScriptLoader from './afterpay-script-loader';

describe('AfterpayPaymentStrategy', () => {
    let checkoutValidator: CheckoutValidator;
    let checkoutRequestSender: CheckoutRequestSender;
    let initializePaymentAction: Observable<Action>;
    let loadPaymentMethodAction: Observable<Action>;
    let loadRemoteSettingsAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let scriptLoader: AfterpayScriptLoader;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: AfterpayPaymentStrategy;

    const afterpaySdk = {
        initialize: () => {},
        redirect: () => {},
    };

    beforeEach(() => {
        orderRequestSender = new OrderRequestSender(createRequestSender());
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        spamProtectionActionCreator = new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()));
        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator, spamProtectionActionCreator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
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

        initializePaymentAction = of(createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested));
        loadPaymentMethodAction = of(createAction(
            PaymentMethodActionType.LoadPaymentMethodSucceeded,
            { ...paymentMethod, id: 'afterpay' },
            { methodId: paymentMethod.gateway }
        ));
        loadRemoteSettingsAction = of(createAction(
            RemoteCheckoutActionType.LoadRemoteSettingsSucceeded,
            { useStoreCredit: false },
            { methodId: paymentMethod.gateway }
        ));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

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
        jest.spyOn(afterpaySdk, 'redirect').mockImplementation(() => {});
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

        it('redirects to Afterpay', () => {
            expect(afterpaySdk.initialize).toHaveBeenCalledWith({ countryCode: 'US' });
            expect(afterpaySdk.redirect).toHaveBeenCalledWith({ token: paymentMethod.clientToken });
        });

        it('notifies store credit usage to remote checkout service', () => {
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith( paymentMethod.gateway, { useStoreCredit: false });
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
                .mockReturnValue(of(createErrorAction(RemoteCheckoutActionType.InitializeRemotePaymentFailed, new Error())));

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
                order: {},
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
