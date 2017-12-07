import { Observable } from 'rxjs';
import { getPayment, getErrorPaymentResponseBody, getPaymentResponseBody } from './payments.mock';
import { getResponse } from '../../http-request/responses.mock';
import * as actionTypes from './payment-action-types';
import PaymentActionCreator from './payment-action-creator';

describe('PaymentActionCreator', () => {
    let paymentActionCreator;
    let paymentRequestSender;

    beforeEach(() => {
        paymentRequestSender = {
            submitPayment: jest.fn(() => Promise.resolve(getResponse(getPaymentResponseBody()))),
        };

        paymentActionCreator = new PaymentActionCreator(paymentRequestSender);
    });

    describe('#submitPayment()', () => {
        it('dispatches actions to data store', () => {
            paymentActionCreator.submitPayment(getPayment())
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        {
                            type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
                        },
                        {
                            type: actionTypes.SUBMIT_PAYMENT_SUCCEEDED,
                            payload: getPaymentResponseBody(),
                        },
                    ]);
                });
        });

        it('dispatches error actions to data store if unsuccessful', () => {
            jest.spyOn(paymentRequestSender, 'submitPayment').mockReturnValue(
                Promise.reject(getResponse(getErrorPaymentResponseBody()))
            );

            const errorHandler = jest.fn((action) => Observable.of(action));

            paymentActionCreator.submitPayment(getPayment())
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
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
    });
});
