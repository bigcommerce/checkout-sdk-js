import { Observable } from 'rxjs';

import { createCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getResponse } from '../common/http-request/responses.mock';
import { OrderActionCreator, OrderActionType } from '../order';
import { getOrder } from '../order/orders.mock';

import PaymentActionCreator from './payment-action-creator';
import * as actionTypes from './payment-action-types';
import { getErrorPaymentResponseBody, getPayment, getPaymentResponseBody } from './payments.mock';

describe('PaymentActionCreator', () => {
    let client;
    let orderActionCreator;
    let paymentActionCreator;
    let paymentRequestSender;
    let store;

    beforeEach(() => {
        client = {
            loadOrder: jest.fn(() => Promise.resolve(getResponse(getOrder()))),
        };

        paymentRequestSender = {
            initializeOffsitePayment: jest.fn(() => Promise.resolve()),
            submitPayment: jest.fn(() => Promise.resolve(getResponse(getPaymentResponseBody()))),
        };

        orderActionCreator = new OrderActionCreator(client);

        store = createCheckoutStore(getCheckoutStoreState());

        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator);
    });

    describe('#submitPayment()', () => {
        it('dispatches actions to data store', async () => {
            const actions = await paymentActionCreator.submitPayment(getPayment())(store)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                {
                    type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
                },
                {
                    type: actionTypes.SUBMIT_PAYMENT_SUCCEEDED,
                    payload: getPaymentResponseBody(),
                },
                {
                    type: OrderActionType.LoadOrderRequested,
                },
                {
                    type: OrderActionType.LoadOrderSucceeded,
                    payload: getOrder(),
                },
            ]);
        });

        it('dispatches error actions to data store if unsuccessful', async () => {
            jest.spyOn(paymentRequestSender, 'submitPayment').mockReturnValue(
                Promise.reject(getResponse(getErrorPaymentResponseBody()))
            );

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await paymentActionCreator.submitPayment(getPayment())(store)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
                },
                {
                    type: actionTypes.SUBMIT_PAYMENT_FAILED,
                    payload: getResponse(getErrorPaymentResponseBody()),
                    error: true,
                },
            ]);
        });
    });

    describe('#initializeOffsitePayment()', () => {
        it('dispatches actions to data store', async () => {
            const actions = await paymentActionCreator.initializeOffsitePayment(getPayment())(store)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: actionTypes.INITIALIZE_OFFSITE_PAYMENT_REQUESTED },
                { type: actionTypes.INITIALIZE_OFFSITE_PAYMENT_SUCCEEDED },
            ]);
        });

        it('dispatches error actions to data store if unsuccessful', async () => {
            jest.spyOn(paymentRequestSender, 'initializeOffsitePayment').mockReturnValue(
                Promise.reject()
            );

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await paymentActionCreator.initializeOffsitePayment(getPayment())(store)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: actionTypes.INITIALIZE_OFFSITE_PAYMENT_REQUESTED,
                },
                {
                    type: actionTypes.INITIALIZE_OFFSITE_PAYMENT_FAILED,
                    error: true,
                },
            ]);
        });
    });
});
