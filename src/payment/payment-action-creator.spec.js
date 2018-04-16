import { Observable } from 'rxjs';

import { getCartState } from '../cart/internal-carts.mock';
import { createCheckoutStore } from '../checkout';
import { getResponse } from '../common/http-request/responses.mock';
import { getConfigState } from '../config/configs.mock';
import { getCustomerState } from '../customer/internal-customers.mock';
import { getSubmittedOrderState } from '../order/internal-orders.mock';
import { getInstrumentsState } from '../payment/instrument/instrument.mock';
import { getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
import { getShippingOptionsState } from '../shipping/internal-shipping-options.mock';

import PaymentActionCreator from './payment-action-creator';
import * as actionTypes from './payment-action-types';
import { getErrorPaymentResponseBody, getPayment, getPaymentResponseBody } from './payments.mock';

describe('PaymentActionCreator', () => {
    let paymentActionCreator;
    let paymentRequestSender;
    let store;

    beforeEach(() => {
        paymentRequestSender = {
            initializeOffsitePayment: jest.fn(() => Promise.resolve()),
            submitPayment: jest.fn(() => Promise.resolve(getResponse(getPaymentResponseBody()))),
        };

        store = createCheckoutStore({
            cart: getCartState(),
            config: getConfigState(),
            customer: getCustomerState(),
            instruments: getInstrumentsState(),
            order: getSubmittedOrderState(),
            quote: getQuoteState(),
            paymentMethods: getPaymentMethodsState(),
            shippingOptions: getShippingOptionsState(),
        });

        paymentActionCreator = new PaymentActionCreator(paymentRequestSender);
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
