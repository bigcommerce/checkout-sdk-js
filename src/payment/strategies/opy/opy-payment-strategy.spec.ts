import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotImplementedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import createPaymentClient from '../../create-payment-client';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getOpy, getPaymentMethodsState } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';
import StorefrontPaymentRequestSender from '../../storefront-payment-request-sender';

import { ActionTypes, OpyPaymentMethod } from './opy';
import OpyPaymentStrategy from './opy-payment-strategy';

describe('OpyPaymentStrategy', () => {
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentClient: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let strategy: OpyPaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        paymentClient = createPaymentClient(store);

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(of(createAction(OrderActionType.SubmitOrderRequested)));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        jest.spyOn(storefrontPaymentRequestSender, 'saveExternalId')
            .mockResolvedValue(undefined);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(of(createAction(PaymentActionType.SubmitPaymentRequested)));

        strategy = new OpyPaymentStrategy(
            store,
            orderActionCreator,
            paymentMethodActionCreator,
            storefrontPaymentRequestSender,
            paymentActionCreator
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
                    methodId: 'opy',
                },
            };
            options = { methodId: 'opy' };
            order = omit(payload, 'payment');

            await strategy.initialize();
        });

        it('executes the strategy successfully', async () => {
            await strategy.execute(payload, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, options);
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('opy', options);
            expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith('opy', '3000000091451');
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({ methodId: 'opy', paymentData: { nonce: '3000000091451' }});
        });

        it('redirects to Openpay URL', async () => {
            const paymentFailedErrorAction = of(createErrorAction(
                PaymentActionType.SubmitPaymentFailed,
                new RequestError(getResponse({
                    ...getErrorPaymentResponseBody(),
                    status: 'additional_action_required',
                }))
            ));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(paymentFailedErrorAction);

            window.location.assign = jest.fn();

            strategy.execute(payload, options);

            await new Promise(resolve => process.nextTick(resolve));

            expect(window.location.assign).toBeCalledWith(
                'https://retailer.myopenpay.com.au/websalestraining?TransactionToken=Al5dE65...%3D&JamPlanID=3000000091451'
            );
        });

        describe('fails to execute if:', () => {
            it('payment argument is invalid', async () => {
                payload.payment = undefined;

                await expect(strategy.execute(payload, options)).rejects.toThrow(PaymentArgumentInvalidError);
            });

            it('payment method is not found', async () => {
                payload.payment = { methodId: 'unkwnown' };

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('payment method is not an OpyPaymentMethod', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValueOnce({ ...getOpy(), initializationData: undefined });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('nonce is empty', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValueOnce({ ...getOpy(), clientToken: '' });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('nextAction type is not supported', async () => {
                const initializationData = (getOpy() as OpyPaymentMethod).initializationData;
                initializationData.nextAction.type = ActionTypes.WAIT_FOR_CUSTOMER;

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValueOnce({ ...getOpy(), initializationData });

                const paymentFailedErrorAction = of(createErrorAction(
                    PaymentActionType.SubmitPaymentFailed,
                    new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        status: 'additional_action_required',
                    }))
                ));

                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(paymentFailedErrorAction);

                await expect(strategy.execute(payload, options)).rejects.toThrow(NotImplementedError);
            });

            it('RequestError status is not additional_action_required', async () => {
                const paymentFailedErrorAction = of(createErrorAction(
                    PaymentActionType.SubmitPaymentFailed,
                    new RequestError(getResponse(getErrorPaymentResponseBody()))
                ));

                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(paymentFailedErrorAction);

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
