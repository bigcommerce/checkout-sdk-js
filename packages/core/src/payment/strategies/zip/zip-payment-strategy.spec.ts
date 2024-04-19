import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckout, getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import {
    PaymentMethodActionCreator,
    PaymentRequestSender,
    StorefrontPaymentRequestSender,
} from '../../../payment';
import { getPaymentMethodsState, getZip } from '../../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import {
    StoreCreditActionCreator,
    StoreCreditActionType,
    StoreCreditRequestSender,
} from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import ZipPaymentStrategy from './zip-payment-strategy';

describe('ZipPaymentStrategy', () => {
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let checkoutActionCreator: CheckoutActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let paymentClient: any;
    let orderActionCreator: OrderActionCreator;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let strategy: ZipPaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender),
        );

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator,
        );

        paymentClient = createPaymentClient(store);

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            store.getState(),
        );

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit').mockReturnValue(
            of(createAction(StoreCreditActionType.ApplyStoreCreditRequested)),
        );

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment').mockResolvedValue(
            store.getState(),
        );

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(
            of(createAction(OrderActionType.SubmitOrderRequested)),
        );

        jest.spyOn(storefrontPaymentRequestSender, 'saveExternalId').mockResolvedValue(undefined);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
            of(createAction(PaymentActionType.SubmitPaymentRequested)),
        );

        strategy = new ZipPaymentStrategy(
            store,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            remoteCheckoutActionCreator,
            orderActionCreator,
            storefrontPaymentRequestSender,
            paymentActionCreator,
        );
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize()).resolves.toEqual(store.getState());
        });
    });

    describe('#execute()', () => {
        let payload: OrderRequestBody;
        let options: PaymentInitializeOptions;
        let order: Omit<OrderRequestBody, 'payment'>;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'zip',
                },
            };
            options = { methodId: 'zip' };
            order = omit(payload, 'payment');

            await strategy.initialize();
        });

        it('executes the strategy successfully', async () => {
            await strategy.execute(payload, options);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith('zip', {
                useStoreCredit: false,
            });
            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, options);
            expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith(
                'zip',
                'checkout_id',
            );
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'zip',
                paymentData: { nonce: 'checkout_id' },
            });
        });

        it('applies store credit to order', async () => {
            jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValueOnce({
                ...getCheckout(),
                isStoreCreditApplied: true,
            });

            await strategy.execute(payload, options);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
        });

        it('redirects to Zip URL', async () => {
            const paymentFailedErrorAction = of(
                createErrorAction(
                    PaymentActionType.SubmitPaymentFailed,
                    new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            status: 'additional_action_required',
                        }),
                    ),
                ),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                paymentFailedErrorAction,
            );

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });

            strategy.execute(payload, options);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith('http://some-url');
        });

        describe('fails to execute if:', () => {
            it('payment argument is invalid', async () => {
                payload.payment = undefined;

                await expect(strategy.execute(payload, options)).rejects.toThrow(
                    PaymentArgumentInvalidError,
                );
            });

            it('payment method is not found', async () => {
                payload.payment = { methodId: '' };

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('clientToken is not valid JSON', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), clientToken: 'm4lf0rm3d j50n' });

                await expect(strategy.execute(payload, options)).rejects.toThrow(SyntaxError);
            });

            it('nonce is empty', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), clientToken: JSON.stringify({ id: '' }) });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('redirectUrl is empty', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), initializationData: { redirectUrl: '' } });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('RequestError status is not additional_action_required', async () => {
                const paymentFailedErrorAction = of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        new RequestError(getResponse(getErrorPaymentResponseBody())),
                    ),
                );

                jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                    paymentFailedErrorAction,
                );

                await expect(strategy.execute(payload, options)).rejects.toThrow(RequestError);
            });
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
