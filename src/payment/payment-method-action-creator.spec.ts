import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import PaymentMethodActionCreator from './payment-method-action-creator';
import { PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { PaymentMethodsResponseBody, PaymentMethodResponseBody } from './payment-method-responses';
import { getPaymentMethodsResponseBody, getPaymentMethodResponseBody } from './payment-methods.mock';

describe('PaymentMethodActionCreator', () => {
    let errorResponse: Response<ErrorResponseBody>;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentMethodResponse: Response<PaymentMethodResponseBody>;
    let paymentMethodsResponse: Response<PaymentMethodsResponseBody>;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        paymentMethodResponse = getResponse(getPaymentMethodResponseBody());
        paymentMethodsResponse = getResponse(getPaymentMethodsResponseBody());

        paymentMethodRequestSender = new PaymentMethodRequestSender(createRequestSender());
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod')
            .mockReturnValue(Promise.resolve(paymentMethodResponse));

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods')
            .mockReturnValue(Promise.resolve(paymentMethodsResponse));
    });

    describe('#loadPaymentMethods()', () => {
        it('sends a request to get a list of payment methods', async () => {
            await paymentMethodActionCreator.loadPaymentMethods().toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalled();
        });

        it('emits actions if able to load payment methods', () => {
            paymentMethodActionCreator.loadPaymentMethods()
                .toArray()
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                        { type: PaymentMethodActionType.LoadPaymentMethodsSucceeded, payload: paymentMethodsResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load payment methods', () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods')
                .mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => Observable.of(action));

            paymentMethodActionCreator.loadPaymentMethods()
                .catch(errorHandler)
                .toArray()
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                        { type: PaymentMethodActionType.LoadPaymentMethodsFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });

    describe('#loadPaymentMethod()', () => {
        it('loads payment method data', async () => {
            const methodId = 'braintree';

            await paymentMethodActionCreator.loadPaymentMethod(methodId).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith(methodId, undefined);
        });

        it('loads payment method data with timeout', async () => {
            const methodId = 'braintree';
            const options = { timeout: createTimeout() };

            await paymentMethodActionCreator.loadPaymentMethod(methodId, options).toPromise();

            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith(methodId, options);
        });

        it('emits actions if able to load payment method', () => {
            const methodId = 'braintree';

            paymentMethodActionCreator.loadPaymentMethod(methodId)
                .toArray()
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                        { type: PaymentMethodActionType.LoadPaymentMethodSucceeded, meta: { methodId }, payload: paymentMethodResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load payment method', () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod')
                .mockReturnValue(Promise.reject(errorResponse));

            const methodId = 'braintree';
            const errorHandler = jest.fn(action => Observable.of(action));

            paymentMethodActionCreator.loadPaymentMethod(methodId)
                .catch(errorHandler)
                .toArray()
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                        { type: PaymentMethodActionType.LoadPaymentMethodFailed, meta: { methodId }, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
