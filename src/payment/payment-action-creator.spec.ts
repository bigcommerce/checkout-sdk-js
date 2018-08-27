import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore, CheckoutValidator } from '../checkout';
import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { getResponse } from '../common/http-request/responses.mock';
import { OrderActionCreator, OrderActionType } from '../order';
import { getOrder } from '../order/orders.mock';

import createPaymentClient from './create-payment-client';
import PaymentActionCreator from './payment-action-creator';
import { PaymentActionType } from './payment-actions';
import PaymentRequestSender from './payment-request-sender';
import { getErrorPaymentResponseBody, getPayment, getPaymentRequestBody, getPaymentResponseBody } from './payments.mock';

describe('PaymentActionCreator', () => {
    let client: CheckoutClient;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentRequestSender: PaymentRequestSender;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        client = createCheckoutClient();
        paymentRequestSender = new PaymentRequestSender(createPaymentClient(store));

        jest.spyOn(client, 'loadOrder')
            .mockReturnValue(Promise.resolve(getResponse(getOrder())));

        jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paymentRequestSender, 'submitPayment')
            .mockReturnValue(Promise.resolve(getResponse(getPaymentResponseBody())));

        orderActionCreator = new OrderActionCreator(client, {} as CheckoutValidator);
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator);
    });

    describe('#submitPayment()', () => {
        it('dispatches actions to data store', async () => {
            const actions = await Observable.from(paymentActionCreator.submitPayment(getPayment())(store))
                .toArray()
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

            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await Observable.from(paymentActionCreator.submitPayment(getPayment())(store))
                .catch(errorHandler)
                .toArray()
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
            await Observable.from(paymentActionCreator.submitPayment(getPayment())(store))
                .toArray()
                .toPromise();

            expect(paymentRequestSender.submitPayment)
                .toHaveBeenCalledWith(getPaymentRequestBody());
        });
    });

    describe('#initializeOffsitePayment()', () => {
        it('dispatches actions to data store', async () => {
            const actions = await Observable.from(paymentActionCreator.initializeOffsitePayment(getPayment())(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentActionType.InitializeOffsitePaymentRequested },
                { type: PaymentActionType.InitializeOffsitePaymentSucceeded },
            ]);
        });

        it('dispatches error actions to data store if unsuccessful', async () => {
            jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
                .mockReturnValue(
                    Promise.reject(new Error())
                );

            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await Observable.from(paymentActionCreator.initializeOffsitePayment(getPayment())(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentActionType.InitializeOffsitePaymentRequested,
                },
                {
                    type: PaymentActionType.InitializeOffsitePaymentFailed,
                    error: true,
                },
            ]);
        });
    });
});
