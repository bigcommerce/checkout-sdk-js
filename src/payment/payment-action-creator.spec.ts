import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutValidator } from '../checkout';
import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { getResponse } from '../common/http-request/responses.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../order';
import { getOrder } from '../order/orders.mock';
import { SpamProtectionActionCreator } from '../order/spam-protection';

import createPaymentClient from './create-payment-client';
import PaymentActionCreator from './payment-action-creator';
import { PaymentActionType } from './payment-actions';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';
import { getErrorPaymentResponseBody, getPayment, getPaymentRequestBody, getPaymentResponseBody } from './payments.mock';

describe('PaymentActionCreator', () => {
    let orderRequestSender: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentRequestSender: PaymentRequestSender;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        orderRequestSender = new OrderRequestSender(createRequestSender());
        paymentRequestSender = new PaymentRequestSender(createPaymentClient(store));
        paymentRequestTransformer = new PaymentRequestTransformer();

        jest.spyOn(orderRequestSender, 'loadOrder')
            .mockReturnValue(Promise.resolve(getResponse(getOrder())));

        jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paymentRequestSender, 'submitPayment')
            .mockReturnValue(Promise.resolve(getResponse(getPaymentResponseBody())));

        orderActionCreator = new OrderActionCreator(orderRequestSender, {} as CheckoutValidator, {} as SpamProtectionActionCreator);
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer);
    });

    describe('#submitPayment()', () => {
        it('dispatches actions to data store', async () => {
            const actions = await from(paymentActionCreator.submitPayment(getPayment())(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: PaymentActionType.SubmitPaymentRequested,
                },
                {
                    type: OrderActionType.LoadOrderRequested,
                },
                {
                    type: OrderActionType.LoadOrderSucceeded,
                    payload: getOrder(),
                },
                {
                    type: PaymentActionType.SubmitPaymentSucceeded,
                    payload: getPaymentResponseBody(),
                },
            ]);
        });

        it('dispatches error actions to data store if unsuccessful', async () => {
            jest.spyOn(paymentRequestSender, 'submitPayment').mockReturnValue(
                Promise.reject(getResponse(getErrorPaymentResponseBody()))
            );

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(paymentActionCreator.submitPayment(getPayment())(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentActionType.SubmitPaymentRequested,
                },
                {
                    type: PaymentActionType.SubmitPaymentFailed,
                    payload: getResponse(getErrorPaymentResponseBody()),
                    error: true,
                },
            ]);
        });

        it('sends request to submit payment', async () => {
            await from(paymentActionCreator.submitPayment(getPayment())(store))
                .pipe(toArray())
                .toPromise();

            expect(paymentRequestSender.submitPayment)
                .toHaveBeenCalledWith(getPaymentRequestBody());
        });
    });

    describe('#initializeOffsitePayment()', () => {
        it('dispatches actions to data store', async () => {
            const payment = getPayment();
            const actions = await from(paymentActionCreator.initializeOffsitePayment(payment.methodId, payment.gatewayId)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentActionType.InitializeOffsitePaymentRequested },
                { type: PaymentActionType.InitializeOffsitePaymentSucceeded },
            ]);
        });

        it('dispatches error actions to data store if unsuccessful', async () => {
            const error = new Error();

            jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
                .mockRejectedValue(error);

            const errorHandler = jest.fn(action => of(action));
            const payment = getPayment();
            const actions = await from(paymentActionCreator.initializeOffsitePayment(payment.methodId, payment.gatewayId)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentActionType.InitializeOffsitePaymentRequested,
                },
                {
                    type: PaymentActionType.InitializeOffsitePaymentFailed,
                    payload: error,
                    error: true,
                },
            ]);
        });
    });
});
