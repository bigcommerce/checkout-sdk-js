import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { NotInitializedError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { PaymentMethod, PaymentMethodActionCreator, PaymentRequestSender } from '../../../payment';
import { getPaymentMethodsState, getZip } from '../../../payment/payment-methods.mock';
import { getZipScriptMock } from '../../../payment/strategies/zip/zip.mock';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentMethodCancelledError, PaymentMethodDeclinedError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestTransformer from '../../payment-request-transformer';
import PaymentStrategy from '../payment-strategy';

import { Zip } from './zip';
import ZipPaymentStrategy from './zip-payment-strategy';
import ZipScriptLoader from './zip-script-loader';

describe('ZipPaymentStrategy', () => {

    let applyStoreCreditAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let scriptLoader: ScriptLoader;
    let strategy: PaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let zipClient: Zip;
    let zipScriptLoader: ZipScriptLoader;

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

        const paymentClient = createPaymentClient(store);
        const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const paymentRequestSender = new PaymentRequestSender(createPaymentClient());

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()))
        );
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            new PaymentRequestTransformer()
        );
        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(createRequestSender())
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

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
        jest.spyOn(store, 'dispatch')
            .mockResolvedValue(store.getState());
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);
        jest.spyOn(zipClient.Checkout, 'init');
        jest.spyOn(zipScriptLoader, 'load')
            .mockResolvedValue(zipClient);

        strategy = new ZipPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            zipScriptLoader,
            requestSender
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
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, zipOptions);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
            expect(zipClient.Checkout.init).toHaveBeenCalledWith(zipInitPayload);
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
            const requestUrl = '/api/storefront/payment/zip/save-external-id';
            jest.spyOn(zipScriptLoader, 'load')
                .mockResolvedValue(referredZipClient);
            await strategy.initialize(zipOptions);

            await strategy.execute(orderRequestBody, zipOptions);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(requestUrl, expect.any(Object));
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
