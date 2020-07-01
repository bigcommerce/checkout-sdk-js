import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import ExternalPaymentStrategy from './external-payment-strategy';

describe('ExternalPaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let store: CheckoutStore;
    let orderRequestSender: OrderRequestSender;
    let strategy: ExternalPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        orderRequestSender = new OrderRequestSender(createRequestSender());
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        formPoster = createFormPoster();
        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation((_url, _data, callback = () => {}) => callback());

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new ExternalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formPoster
        );
    });

    describe('#execute()', () => {
        it('submits order without payment data', async () => {
            const payload = getOrderRequestBody();
            const options = { methodId: 'laybuy' };

            await strategy.execute(payload, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('returns checkout state', async () => {
            const output = await strategy.execute(getOrderRequestBody());

            expect(output).toEqual(store.getState());
        });

        it('throws error when undefined payment is provided', async () => {
            const payload = {
                payment: undefined,
            };

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('redirect to Laybuy if additional action is required', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                additional_action_required: {
                    data : {
                        redirect_url: 'https://sandbox-payment.laybuy..com',
                    },
                    type: 'offsite_redirect',
                },
                status: 'additional_action_required',
            }));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            strategy.execute(getOrderRequestBody());

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://sandbox-payment.laybuy..com', {});
        });

        it('reject payment when error is different to additional_action_required', async () => {
            const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, response)));

            await expect(strategy.execute(getOrderRequestBody())).rejects.toThrowError(response);

            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('submits payment separately', async () => {
            const payload = getOrderRequestBody();
            const options = { methodId: 'laybuy' };
            await strategy.execute(payload, options);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });
    });

    describe('#initialize()', () => {
        it('returns the state', async () => {
            expect(await strategy.initialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('returns the state', async () => {
            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });
});
