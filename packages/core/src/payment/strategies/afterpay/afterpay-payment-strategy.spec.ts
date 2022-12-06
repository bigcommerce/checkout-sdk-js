import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import {
    getCheckout,
    getCheckoutPayment,
    getCheckoutStoreState,
} from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    RequestError,
} from '../../../common/error/errors';
import { getErrorResponse, getResponse } from '../../../common/http-request/responses.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotCompletedError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import {
    StoreCreditActionCreator,
    StoreCreditActionType,
    StoreCreditRequestSender,
} from '../../../store-credit';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getAfterpay } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import AfterpayPaymentStrategy from './afterpay-payment-strategy';
import AfterpayScriptLoader from './afterpay-script-loader';

describe('AfterpayPaymentStrategy', () => {
    let checkoutValidator: CheckoutValidator;
    let checkoutRequestSender: CheckoutRequestSender;
    let loadPaymentMethodAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutRequestSender: RemoteCheckoutRequestSender;
    let storeCreditActionCreator: StoreCreditActionCreator;
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
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(createRequestSender()),
        );
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );
        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(createRequestSender()),
        );
        scriptLoader = new AfterpayScriptLoader(createScriptLoader());
        strategy = new AfterpayPaymentStrategy(
            store,
            checkoutValidator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutRequestSender,
            storeCreditActionCreator,
            scriptLoader,
        );

        paymentMethod = getAfterpay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        loadPaymentMethodAction = of(
            createAction(
                PaymentMethodActionType.LoadPaymentMethodSucceeded,
                { ...paymentMethod, id: 'afterpay' },
                { methodId: paymentMethod.gateway },
            ),
        );

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        jest.spyOn(store, 'dispatch');

        jest.spyOn(checkoutValidator, 'validate').mockReturnValue(
            new Promise<void>((resolve) => resolve()),
        );

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit').mockReturnValue(
            of(createAction(StoreCreditActionType.ApplyStoreCreditSucceeded)),
        );

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(scriptLoader, 'load').mockReturnValue(Promise.resolve(afterpaySdk));

        jest.spyOn(afterpaySdk, 'initialize').mockImplementation(() => {});
        jest.spyOn(afterpaySdk, 'redirect').mockImplementation(() => {});
    });

    describe('#initialize()', () => {
        it('loads script when initializing strategy', async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod, 'US');
        });

        it('loads script when initializing strategy with NZD', async () => {
            store = createCheckoutStore(
                merge(getCheckoutStoreState(), { cart: { data: { currency: { code: 'NZD' } } } }),
            );

            strategy = new AfterpayPaymentStrategy(
                store,
                checkoutValidator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutRequestSender,
                storeCreditActionCreator,
                scriptLoader,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod, 'NZ');
        });
    });

    describe('#execute()', () => {
        const successHandler = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            strategy.execute(payload).then(successHandler);

            await new Promise((resolve) => process.nextTick(resolve));
        });

        it('redirects to Afterpay', () => {
            expect(afterpaySdk.initialize).toHaveBeenCalledWith({ countryCode: 'US' });
            expect(afterpaySdk.redirect).toHaveBeenCalledWith({ token: paymentMethod.clientToken });
        });

        it('applies store credit usage', () => {
            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
        });

        it('validates the checkout', () => {
            expect(checkoutValidator.validate).toHaveBeenCalled();
        });

        it('does not resolve if execution is successful', () => {
            expect(successHandler).not.toHaveBeenCalled();
        });

        it('rejects with error if execution is unsuccessful', async () => {
            jest.spyOn(storeCreditActionCreator, 'applyStoreCredit').mockReturnValue(
                of(createErrorAction(StoreCreditActionType.ApplyStoreCreditFailed, new Error())),
            );

            const errorHandler = jest.fn();

            strategy.execute(payload).catch(errorHandler);

            await new Promise((resolve) => process.nextTick(resolve));

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

        it('throws InvalidArgumentError if loadPaymentMethod fails', async () => {
            const errorResponse = merge(getErrorResponse(), {
                body: {
                    status: 422,
                },
            });

            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockImplementation(() => {
                throw new RequestError(errorResponse);
            });

            expect(store.dispatch).toHaveBeenCalledWith(loadPaymentMethodAction);

            await expect(strategy.execute(payload)).rejects.toThrow(InvalidArgumentError);
        });

        it('loads payment client token', () => {
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(
                paymentMethod.gateway,
                { params: { method: paymentMethod.id } },
            );
            expect(store.dispatch).toHaveBeenCalledWith(loadPaymentMethodAction);
        });
    });

    describe('#finalize()', () => {
        const nonce = 'bar';

        beforeEach(() => {
            store = createCheckoutStore(
                merge({}, getCheckoutStoreState(), {
                    config: {
                        data: {
                            context: { payment: { token: nonce } },
                        },
                    },
                    checkout: {
                        data: {
                            ...getCheckout(),
                            payments: [
                                {
                                    ...getCheckoutPayment(),
                                    providerId: paymentMethod.id,
                                    gatewayId: paymentMethod.gateway,
                                },
                            ],
                        },
                    },
                    order: {},
                }),
            );

            strategy = new AfterpayPaymentStrategy(
                store,
                checkoutValidator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutRequestSender,
                storeCreditActionCreator,
                scriptLoader,
            );

            jest.spyOn(store, 'dispatch');
        });

        it('submits the order and the payment', async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });
            await strategy.finalize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                {},
                { methodId: paymentMethod.id, gatewayId: paymentMethod.gateway },
            );

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: paymentMethod.id,
                paymentData: { nonce },
            });

            jest.spyOn(remoteCheckoutRequestSender, 'forgetCheckout');

            expect(remoteCheckoutRequestSender.forgetCheckout).not.toHaveBeenCalled();
        });

        it('throws error if unable to finalize order due to missing data', async () => {
            store = createCheckoutStore(getCheckoutStoreState());
            strategy = new AfterpayPaymentStrategy(
                store,
                checkoutValidator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutRequestSender,
                storeCreditActionCreator,
                scriptLoader,
            );

            await expect(
                strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway }),
            ).rejects.toThrow(MissingDataError);
        });

        it('throws OrderFinalizationNotCompleted error if unable to finalize order', async () => {
            const response = new RequestError(getResponse(getErrorPaymentResponseBody()));
            const paymentFailedErrorAction = of(
                createErrorAction(PaymentActionType.SubmitPaymentFailed, response),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                paymentFailedErrorAction,
            );
            jest.spyOn(remoteCheckoutRequestSender, 'forgetCheckout').mockReturnValue(
                Promise.resolve(),
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethods').mockReturnValue(
                of(
                    createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [
                        getAfterpay(),
                    ]),
                ),
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(
                strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway }),
            ).rejects.toThrow(OrderFinalizationNotCompletedError);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(paymentFailedErrorAction);

            expect(remoteCheckoutRequestSender.forgetCheckout).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethods).toHaveBeenCalled();
        });
    });
});
