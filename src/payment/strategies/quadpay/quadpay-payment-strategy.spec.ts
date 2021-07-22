import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentMethodActionCreator, PaymentRequestSender, StorefrontPaymentRequestSender } from '../../../payment';
import { getPaymentMethodsState, getQuadpay } from '../../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import QuadpayPaymentStrategy from './quadpay-payment-strategy';

describe('QuadpayPaymentStrategy', () => {
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;
    let checkoutMock: Checkout;
    let applyStoreCreditAction: Observable<Action>;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let strategy: QuadpayPaymentStrategy;

    beforeEach(() => {
        const paymentClient = createPaymentClient(store);

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        requestSender = createRequestSender();

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );
        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender)
        );
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender)
        );
        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

        checkoutMock = getCheckout();

        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow')
            .mockReturnValue(checkoutMock);

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit')
            .mockReturnValue(applyStoreCreditAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockResolvedValue(store.getState());

        jest.spyOn(storefrontPaymentRequestSender, 'saveExternalId')
            .mockResolvedValue(undefined);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(requestSender, 'post')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new QuadpayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            remoteCheckoutActionCreator,
            storefrontPaymentRequestSender
        );
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize()).resolves.toEqual(store.getState());
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let quadpayOptions: PaymentInitializeOptions;

        beforeEach(async () => {
            orderRequestBody = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'quadpay',
                },
            };
            quadpayOptions = { methodId: 'quadpay' };

            await strategy.initialize();
        });

        describe('executes the strategy successfully and...', () => {
            let order: Omit<OrderRequestBody, 'payment'>;
            const expectedPayment = {
                methodId: 'quadpay',
                paymentData: {
                    nonce: 'checkout_id',
                },
            };

            beforeEach(() => {
                order = omit(orderRequestBody, 'payment');
            });

            it('submits the payment', async () => {
                await strategy.execute(orderRequestBody, quadpayOptions);

                expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
                expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith(expectedPayment.methodId, { useStoreCredit: false });
                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, quadpayOptions);
                expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith(expectedPayment.methodId, expectedPayment.paymentData.nonce);
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            });

            it('applies the store credit', async () => {
                checkoutMock.isStoreCreditApplied = true;

                await strategy.execute(orderRequestBody, quadpayOptions);

                expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
                expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith(expectedPayment.methodId, { useStoreCredit: true });
                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, quadpayOptions);
                expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith(expectedPayment.methodId, expectedPayment.paymentData.nonce);
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            });
        });

        it('redirects to Quadpay url', async () => {
            const additionalActionRequiredError = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                status: 'additional_action_required',
            }));
            const paymentFailedErrorAction = of(createErrorAction(
                PaymentActionType.SubmitPaymentFailed,
                additionalActionRequiredError)
            );

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(paymentFailedErrorAction);

            window.location.replace = jest.fn();

            strategy.execute(orderRequestBody, quadpayOptions);

            await new Promise(resolve => process.nextTick(resolve));

            expect(window.location.replace).toBeCalledWith('http://some-url');
        });

        it('fails to execute if payment argument is invalid', async () => {
            orderRequestBody.payment = undefined;

            await expect(strategy.execute(orderRequestBody, quadpayOptions)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('fails to execute if payment method is not found', async () => {
            orderRequestBody.payment = { methodId: '' };

            await expect(strategy.execute(orderRequestBody, quadpayOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to execute if clientToken is not valid JSON', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue({ ...getQuadpay(), clientToken: 'm4lf0rm3d j50n' });

            await expect(strategy.execute(orderRequestBody, quadpayOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to execute if nonce is empty', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue({ ...getQuadpay(), clientToken: '' });

            await expect(strategy.execute(orderRequestBody, quadpayOptions)).rejects.toThrow(MissingDataError);
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
        });
    });
});
