import { Observable } from 'rxjs';
import { getPayment, getErrorPaymentResponseBody, getPaymentResponseBody } from './payments.mock';
import { getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './payment-action-types';
import PaymentActionCreator from './payment-action-creator';

describe('PaymentActionCreator', () => {
    let paymentActionCreator;
    let paymentRequestSender;

    beforeEach(() => {
        paymentRequestSender = {
            initializeOffsitePayment: jest.fn(() => Promise.resolve()),
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

    describe('#initializeOffsitePayment()', () => {
        it('dispatches actions to data store', async () => {
            const actions = await paymentActionCreator.initializeOffsitePayment(getPayment())
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
            const actions = await paymentActionCreator.initializeOffsitePayment(getPayment())
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
