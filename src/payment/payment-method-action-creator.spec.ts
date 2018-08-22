import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import PaymentMethod from './payment-method';
import PaymentMethodActionCreator from './payment-method-action-creator';
import { PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { getPaymentMethod, getPaymentMethods, getPaymentMethodsMeta } from './payment-methods.mock';

describe('PaymentMethodActionCreator', () => {
    let errorResponse: Response<ErrorResponseBody>;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentMethodResponse: Response<PaymentMethod>;
    let paymentMethodsResponse: Response<PaymentMethod[]>;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        paymentMethodResponse = getResponse(getPaymentMethod());
        paymentMethodsResponse = getResponse(getPaymentMethods(), {
            'x-device-session-id': getPaymentMethodsMeta().deviceSessionId,
            'x-session-hash': getPaymentMethodsMeta().sessionHash,
        });

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

        it('emits actions if able to load payment methods', async () => {
            const actions = await paymentMethodActionCreator.loadPaymentMethods()
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                {
                    type: PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                    payload: paymentMethodsResponse.body,
                    meta: {
                        deviceSessionId: paymentMethodsResponse.headers['x-device-session-id'],
                        sessionHash: paymentMethodsResponse.headers['x-session-hash'],
                    },
                },
            ]);
        });

        it('emits error actions if unable to load payment methods', async () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods')
                .mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await paymentMethodActionCreator.loadPaymentMethods()
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodsRequested },
                { type: PaymentMethodActionType.LoadPaymentMethodsFailed, payload: errorResponse, error: true },
            ]);
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

        it('emits actions if able to load payment method', async () => {
            const methodId = 'braintree';
            const actions = await paymentMethodActionCreator.loadPaymentMethod(methodId)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                { type: PaymentMethodActionType.LoadPaymentMethodSucceeded, meta: { methodId }, payload: paymentMethodResponse.body },
            ]);
        });

        it('emits error actions if unable to load payment method', async () => {
            jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod')
                .mockReturnValue(Promise.reject(errorResponse));

            const methodId = 'braintree';
            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await paymentMethodActionCreator.loadPaymentMethod(methodId)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentMethodActionType.LoadPaymentMethodRequested, meta: { methodId } },
                { type: PaymentMethodActionType.LoadPaymentMethodFailed, meta: { methodId }, payload: errorResponse, error: true },
            ]);
        });
    });
});
