import { createTimeout, Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutClient, CheckoutClient } from '../checkout';
import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import PaymentMethodActionCreator from './payment-method-action-creator';
import * as actionTypes from './payment-method-action-types';
import { PaymentMethodsResponseBody, PaymentMethodResponseBody } from './payment-method-responses';
import { getPaymentMethodsResponseBody, getPaymentMethodResponseBody } from './payment-methods.mock';

describe('PaymentMethodActionCreator', () => {
    let checkoutClient: CheckoutClient;
    let errorResponse: Response<ErrorResponseBody>;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodResponse: Response<PaymentMethodResponseBody>;
    let paymentMethodsResponse: Response<PaymentMethodsResponseBody>;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        paymentMethodResponse = getResponse(getPaymentMethodResponseBody());
        paymentMethodsResponse = getResponse(getPaymentMethodsResponseBody());

        checkoutClient = createCheckoutClient();
        paymentMethodActionCreator = new PaymentMethodActionCreator(checkoutClient);

        jest.spyOn(checkoutClient, 'loadPaymentMethod')
            .mockReturnValue(Promise.resolve(paymentMethodResponse));

        jest.spyOn(checkoutClient, 'loadPaymentMethods')
            .mockReturnValue(Promise.resolve(paymentMethodsResponse));
    });

    describe('#loadPaymentMethods()', () => {
        it('sends a request to get a list of payment methods', async () => {
            await paymentMethodActionCreator.loadPaymentMethods().toPromise();

            expect(checkoutClient.loadPaymentMethods).toHaveBeenCalled();
        });

        it('emits actions if able to load payment methods', () => {
            paymentMethodActionCreator.loadPaymentMethods()
                .toArray()
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_PAYMENT_METHODS_REQUESTED },
                        { type: actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED, payload: paymentMethodsResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load payment methods', () => {
            jest.spyOn(checkoutClient, 'loadPaymentMethods')
                .mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => Observable.of(action));

            paymentMethodActionCreator.loadPaymentMethods()
                .catch(errorHandler)
                .toArray()
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_PAYMENT_METHODS_REQUESTED },
                        { type: actionTypes.LOAD_PAYMENT_METHODS_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });

    describe('#loadPaymentMethod()', () => {
        it('loads payment method data', async () => {
            const methodId = 'braintree';

            await paymentMethodActionCreator.loadPaymentMethod(methodId).toPromise();

            expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith(methodId, undefined);
        });

        it('loads payment method data with timeout', async () => {
            const methodId = 'braintree';
            const options = { timeout: createTimeout() };

            await paymentMethodActionCreator.loadPaymentMethod(methodId, options).toPromise();

            expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith(methodId, options);
        });

        it('emits actions if able to load payment method', () => {
            const methodId = 'braintree';

            paymentMethodActionCreator.loadPaymentMethod(methodId)
                .toArray()
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, meta: { methodId } },
                        { type: actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, meta: { methodId }, payload: paymentMethodResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load payment method', () => {
            jest.spyOn(checkoutClient, 'loadPaymentMethod')
                .mockReturnValue(Promise.reject(errorResponse));

            const methodId = 'braintree';
            const errorHandler = jest.fn(action => Observable.of(action));

            paymentMethodActionCreator.loadPaymentMethod(methodId)
                .catch(errorHandler)
                .toArray()
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, meta: { methodId } },
                        { type: actionTypes.LOAD_PAYMENT_METHOD_FAILED, meta: { methodId }, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
