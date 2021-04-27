import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutState } from '../../../checkout/checkouts.mock';
import { NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentMethod, PaymentMethodActionCreator, PaymentRequestSender } from '../../../payment';
import { getPaymentMethodsState, getQuadpay } from '../../../payment/payment-methods.mock';
import { getQuadpayScriptMock } from '../../../payment/strategies/quadpay/quadpay.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentMethodCancelledError, PaymentMethodDeclinedError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';
import PaymentStrategy from '../payment-strategy';

import { Quadpay } from './quadpay';
import QuadpayPaymentStrategy from './quadpay-payment-strategy';
import QuadpayScriptLoader from './quadpay-script-loader';

describe('QuadpayPaymentStrategy', () => {

    let applyStoreCreditAction: Observable<Action>;
    let checkoutMock: Checkout;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let scriptLoader: ScriptLoader;
    let strategy: PaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let quadpayClient: Quadpay;
    let quadpayScriptLoader: QuadpayScriptLoader;

    beforeEach(() => {
        paymentMethodMock = getQuadpay();
        scriptLoader = createScriptLoader();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        quadpayClient = getQuadpayScriptMock('approved');
        quadpayScriptLoader = new QuadpayScriptLoader(scriptLoader);
        requestSender = createRequestSender();

        const paymentClient = createPaymentClient(store);
        const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const paymentRequestSender = new PaymentRequestSender(createPaymentClient());

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender));
        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(createRequestSender())
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        checkoutMock = getCheckout();

        jest.spyOn(store, 'dispatch');

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit')
            .mockReturnValue(applyStoreCreditAction);

        jest.spyOn(requestSender, 'sendRequest')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow')
            .mockReturnValue(checkoutMock);

        jest.spyOn(quadpayClient.Checkout, 'init');

        jest.spyOn(quadpayScriptLoader, 'load')
            .mockResolvedValue(quadpayClient);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockResolvedValue(store.getState());

        strategy = new QuadpayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            remoteCheckoutActionCreator,
            quadpayScriptLoader,
            requestSender
        );
    });

    describe('#initialize()', () => {
        let quadpayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            quadpayOptions = { methodId: 'quadpay' };
        });

        it('initializes the strategy successfully', async () => {
            await strategy.initialize(quadpayOptions);

            expect(quadpayScriptLoader.load).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        let quadpayOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;

        beforeEach(async () => {
            orderRequestBody = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'quadpay',
                },
            };
            quadpayOptions = { methodId: 'quadpay' };

            await strategy.initialize(quadpayOptions);
        });

        it('executes the strategy successfully and submits the payment', async () => {
            const { payment, ...order } = orderRequestBody;
            const expectedPayment = {
                methodId: 'quadpay',
                paymentData: {
                    nonce: 'checkoutId',
                },
            };
            const quadpayInitPayload = {
                onComplete: expect.any(Function),
                onCheckout: expect.any(Function),
            };
            await strategy.execute(orderRequestBody, quadpayOptions);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith(expectedPayment.methodId, { useStoreCredit: false });
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, quadpayOptions);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
            expect(quadpayClient.Checkout.init).toHaveBeenCalledWith(quadpayInitPayload);
        });

        it('executes the strategy successfully and applies the store credit', async () => {
            const expectedPayment = {
                methodId: 'quadpay',
                paymentData: {
                    nonce: 'checkoutId',
                },
            };

            checkoutMock.isStoreCreditApplied = true;

            await strategy.execute(orderRequestBody, quadpayOptions);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith(expectedPayment.methodId, { useStoreCredit: true });
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('fails to execute the strategy if the quadpay client was not loaded', async () => {
            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(undefined);
            await strategy.initialize(quadpayOptions);

            try {
                await strategy.execute(orderRequestBody, quadpayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitOrderAction);
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
                expect(quadpayClient.Checkout.init).not.toHaveBeenCalled();
            }
        });

        it('fails to execute the strategy if lightbox fails to provide a checkoutId', async () => {
            const noIdQuadpayClient = getQuadpayScriptMock('noCheckoutId');
            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(noIdQuadpayClient);
            await strategy.initialize(quadpayOptions);

            try {
                await strategy.execute(orderRequestBody, quadpayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('cancels the strategy execution if the lightbox is closed', async () => {
            const cancelledQuadpayClient = getQuadpayScriptMock('cancelled');
            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(cancelledQuadpayClient);
            await strategy.initialize(quadpayOptions);

            try {
                await strategy.execute(orderRequestBody, quadpayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodCancelledError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('fails to execute the strategy if the response state provided by the lightbox is neither approved or cancelled', async () => {
            const errorQuadpayClient = getQuadpayScriptMock('error');
            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(errorQuadpayClient);
            await strategy.initialize(quadpayOptions);

            try {
                await strategy.execute(orderRequestBody, quadpayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('throws an error if the registration is declined', async () => {
            const declinedQuadpayClient = getQuadpayScriptMock('declined');
            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(declinedQuadpayClient);
            await strategy.initialize(quadpayOptions);

            try {
                await strategy.execute(orderRequestBody, quadpayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodDeclinedError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('continues to order confirmation if the registration is referred', async () => {
            const referredQuadpayClient = getQuadpayScriptMock('referred');
            const requestUrl = '/api/storefront/payment/quadpay/save-external-id';
            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(referredQuadpayClient);

            await strategy.initialize(quadpayOptions);
            await strategy.execute(orderRequestBody, quadpayOptions);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(requestUrl, expect.any(Object));
        });

        it('continues to order confirmation if the registration is referred with experiment quadpay_deferred_flow enabled', async () => {
            const referredQuadpayClient = getQuadpayScriptMock('referred');
            const requestUrl = '/api/storefront/payment/quadpay/save-external-id';

            paymentMethodMock = {
                ...getQuadpay(),
                initializationData: {
                    deferredFlowV2Enabled: true,
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(paymentMethodMock);

            jest.spyOn(quadpayScriptLoader, 'load')
                .mockResolvedValue(referredQuadpayClient);

            const expectedPayment = {
                methodId: 'quadpay',
                paymentData: {
                    nonce: 'checkoutId',
                },
            };

            await strategy.initialize(quadpayOptions);
            await strategy.execute(orderRequestBody, quadpayOptions);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(requestUrl, expect.any(Object));
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('redirects to Quadpay url', async () => {
            const paymentMethodMock = {
                ...getQuadpay(),
                initializationData: {
                    redirectFlowV2Enabled: true,
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(paymentMethodMock);

            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                status: 'additional_action_required',
                additional_action_required: {
                    type: 'external_redirect',
                    data: {
                        redirect_url: 'http://some-url',
                    },
                } ,
            }));
            window.location.replace = jest.fn();

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            await strategy.deinitialize();
            await strategy.initialize(quadpayOptions);
            strategy.execute(orderRequestBody, quadpayOptions);
            await new Promise(resolve => process.nextTick(resolve));

            expect(window.location.replace).toBeCalledWith('http://some-url');
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const quadpayOptions: PaymentInitializeOptions = { methodId: 'quadpay' };
            await strategy.initialize(quadpayOptions);
            await strategy.deinitialize();

            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
