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
import { PaymentMethod, PaymentMethodActionCreator, PaymentRequestSender, StorefrontPaymentRequestSender } from '../../../payment';
import { getPaymentMethodsState, getZip } from '../../../payment/payment-methods.mock';
import { getZipScriptMock } from '../../../payment/strategies/zip/zip.mock';
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

import { Zip } from './zip';
import ZipPaymentStrategy from './zip-payment-strategy';
import ZipScriptLoader from './zip-script-loader';

describe('ZipPaymentStrategy', () => {

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
    let zipClient: Zip;
    let zipScriptLoader: ZipScriptLoader;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;

    beforeEach(() => {
        paymentMethodMock = getZip();
        scriptLoader = createScriptLoader();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        zipClient = getZipScriptMock('approved');
        zipScriptLoader = new ZipScriptLoader(scriptLoader);
        requestSender = createRequestSender();
        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

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
        jest.spyOn(store, 'dispatch');
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);
        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow')
            .mockReturnValue(checkoutMock);
        jest.spyOn(zipClient.Checkout, 'init');
        jest.spyOn(zipScriptLoader, 'load')
            .mockResolvedValue(zipClient);
        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockResolvedValue(store.getState());
        jest.spyOn(storefrontPaymentRequestSender, 'saveExternalId')
            .mockResolvedValue(undefined);

        strategy = new ZipPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            remoteCheckoutActionCreator,
            zipScriptLoader,
            storefrontPaymentRequestSender
        );
    });

    describe('#initialize()', () => {
        let zipOptions: PaymentInitializeOptions;

        beforeEach(() => {
            zipOptions = { methodId: 'zip' };
        });

        it('initializes the strategy successfully', async () => {
            await strategy.initialize(zipOptions);

            expect(zipScriptLoader.load).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        let zipOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;

        beforeEach(async () => {
            orderRequestBody = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'zip',
                },
            };
            zipOptions = { methodId: 'zip' };

            await strategy.initialize(zipOptions);
        });

        it('executes the strategy successfully and submits the payment', async () => {
            const { payment, ...order } = orderRequestBody;
            const expectedPayment = {
                methodId: 'zip',
                paymentData: {
                    nonce: 'checkoutId',
                },
            };
            const zipInitPayload = {
                onComplete: expect.any(Function),
                onCheckout: expect.any(Function),
            };
            await strategy.execute(orderRequestBody, zipOptions);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith(expectedPayment.methodId, { useStoreCredit: false });
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, zipOptions);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
            expect(zipClient.Checkout.init).toHaveBeenCalledWith(zipInitPayload);
        });

        it('executes the strategy successfully and applies the store credit', async () => {
            const expectedPayment = {
                methodId: 'zip',
                paymentData: {
                    nonce: 'checkoutId',
                },
            };

            checkoutMock.isStoreCreditApplied = true;

            await strategy.execute(orderRequestBody, zipOptions);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith(expectedPayment.methodId, { useStoreCredit: true });
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('fails to execute the strategy if the zip client was not loaded', async () => {
            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(undefined);
            await strategy.initialize(zipOptions);

            try {
                await strategy.execute(orderRequestBody, zipOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitOrderAction);
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
                expect(zipClient.Checkout.init).not.toHaveBeenCalled();
            }
        });

        it('fails to execute the strategy if lightbox fails to provide a checkoutId', async () => {
            const noIdZipClient = getZipScriptMock('noCheckoutId');
            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(noIdZipClient);
            await strategy.initialize(zipOptions);

            try {
                await strategy.execute(orderRequestBody, zipOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('cancels the strategy execution if the lightbox is closed', async () => {
            const cancelledZipClient = getZipScriptMock('cancelled');
            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(cancelledZipClient);
            await strategy.initialize(zipOptions);

            try {
                await strategy.execute(orderRequestBody, zipOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodCancelledError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('fails to execute the strategy if the response state provided by the lightbox is neither approved or cancelled', async () => {
            const errorZipClient = getZipScriptMock('error');
            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(errorZipClient);
            await strategy.initialize(zipOptions);

            try {
                await strategy.execute(orderRequestBody, zipOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('throws an error if the registration is declined', async () => {
            const declinedZipClient = getZipScriptMock('declined');
            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(declinedZipClient);
            await strategy.initialize(zipOptions);

            try {
                await strategy.execute(orderRequestBody, zipOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodDeclinedError);
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            }
        });

        it('continues to order confirmation if the registration is referred', async () => {
            const referredZipClient = getZipScriptMock('referred');

            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(referredZipClient);

            await strategy.initialize(zipOptions);
            await strategy.execute(orderRequestBody, zipOptions);

            expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith('zip', 'checkoutId');
        });

        it('continues to order confirmation if the registration is referred with experiment zip_deferred_flow enabled', async () => {
            const referredZipClient = getZipScriptMock('referred');

            paymentMethodMock = {
                ...getZip(),
                initializationData: {
                    deferredFlowV2Enabled: true,
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(paymentMethodMock);

            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(referredZipClient);

            const expectedPayment = {
                methodId: 'zip',
                paymentData: {
                    nonce: 'checkoutId',
                },
            };

            await strategy.initialize(zipOptions);
            await strategy.execute(orderRequestBody, zipOptions);

            expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith('zip', 'checkoutId');
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('redirects to Zip url', async () => {
            const paymentMethodMock = {
                ...getZip(),
                initializationData: {
                    redirectFlowV2Enabled: true,
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(paymentMethodMock);

            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                status: 'additional_action_required',
            }));
            window.location.replace = jest.fn();

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            await strategy.deinitialize();
            await strategy.initialize(zipOptions);
            strategy.execute(orderRequestBody, zipOptions);
            await new Promise(resolve => process.nextTick(resolve));

            expect(window.location.replace).toBeCalledWith('http://some-url');
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const zipOptions: PaymentInitializeOptions = { methodId: 'zip' };
            await strategy.initialize(zipOptions);
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
