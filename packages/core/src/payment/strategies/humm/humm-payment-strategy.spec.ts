import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import { PaymentExecuteError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getHumm } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import HummPaymentStrategy from './humm-payment-strategy';

describe('HummPaymentStrategy', () => {
    let checkoutValidator: CheckoutValidator;
    let checkoutRequestSender: CheckoutRequestSender;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: HummPaymentStrategy;
    let formPoster: FormPoster;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderRequestSender = new OrderRequestSender(createRequestSender());
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(createRequestSender()),
        );

        paymentMethod = getHumm();
        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        formPoster = createFormPoster();

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(formPoster, 'postForm').mockReturnValue(Promise.resolve());

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            store.getState(),
        );

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
            ...getHumm(),
            initializationData: { processable: true },
        });

        strategy = new HummPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formPoster,
            paymentMethodActionCreator,
        );
    });

    describe('#execute()', () => {
        it('throws error when undefined payment is provided', async () => {
            payload = { payment: undefined };

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('returns checkout state', async () => {
            const output = await strategy.execute(getOrderRequestBody());

            expect(output).toEqual(store.getState());
        });

        it('redirect to Humm', async () => {
            const data = JSON.stringify({ data: 'data' });

            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    provider_data: data,
                    additional_action_required: {
                        type: 'offsite_redirect',
                        data: {
                            redirect_url: 'https://sandbox-payment.humm.com',
                        },
                    },
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)),
            );

            strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://sandbox-payment.humm.com', {
                data: 'data',
            });
        });

        it('throws PaymentExecuteError when not processable', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getHumm(),
                initializationData: { processable: false },
            });

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentExecuteError);
        });

        it('reject payment when error is different to additional_action_required', async () => {
            const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)),
            );

            await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(error);
        });
    });
});
