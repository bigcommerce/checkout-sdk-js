import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutValidator } from '../checkout';
import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { CancellablePromise } from '../common/utility';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../order';
import { getOrder } from '../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../spam-protection';

import createPaymentClient from './create-payment-client';
import { PaymentMethodCancelledError } from './errors';
import PaymentActionCreator from './payment-action-creator';
import { PaymentActionType } from './payment-actions';
import PaymentAdditionalAction from './payment-additional-action';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';
import { getErrorPaymentResponseBody, getPayment, getPaymentRequestBody, getPaymentResponseBody } from './payments.mock';

describe('PaymentActionCreator', () => {
    let orderRequestSender: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentRequestSender: PaymentRequestSender;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let store: CheckoutStore;
    let errorResponse: RequestError;
    let additionalActionMock: PaymentAdditionalAction;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        orderRequestSender = new OrderRequestSender(createRequestSender());
        paymentRequestSender = new PaymentRequestSender(createPaymentClient(store));
        paymentRequestTransformer = new PaymentRequestTransformer();
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));

        jest.spyOn(orderRequestSender, 'loadOrder')
            .mockReturnValue(Promise.resolve(getResponse(getOrder())));

        jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paymentRequestSender, 'submitPayment')
            .mockReturnValue(Promise.resolve(getResponse(getPaymentResponseBody())));

        jest.spyOn(paymentRequestTransformer, 'transform');

        orderActionCreator = new OrderActionCreator(orderRequestSender, {} as CheckoutValidator);
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer, paymentHumanVerificationHandler);

        errorResponse = {
            ...getErrorResponse(),
            body: {
                ...getErrorPaymentResponseBody(),
                status: 'additional_action_required',
                additional_action_required: {
                    type: 'recaptcha_v2_verification',
                    data: {
                        key: 'recaptchakey123',
                    },
                },
            },
            errors: [],
            name: '',
            type: '',
            message: '',
        };

        additionalActionMock = {
            type: 'recaptcha_v2_verification',
            data: {
                human_verification_token: 'googleRecaptchaToken',
            },
        };
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

        it('executes human verification when verification requested error returned', async () => {
            jest.spyOn(paymentRequestSender, 'submitPayment').mockReturnValue(
                Promise.reject(errorResponse)
            );
            const errorHandler = jest.spyOn(paymentHumanVerificationHandler, 'handle')
                .mockReturnValue(Promise.resolve(additionalActionMock));

            await from(paymentActionCreator.submitPayment(getPayment())(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();

            return expect(paymentHumanVerificationHandler.handle).toHaveBeenCalledWith(errorResponse);
        });

        it('sends payment request again after human verification performed', async () => {
            jest.spyOn(paymentRequestSender, 'submitPayment').mockReturnValue(
                Promise.reject(errorResponse)
            );
            const errorHandler = await jest.spyOn(paymentHumanVerificationHandler, 'handle')
                .mockReturnValue(Promise.resolve(additionalActionMock));

            await from(paymentActionCreator.submitPayment(getPayment())(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(paymentRequestSender.submitPayment).toHaveBeenCalledTimes(2);
        });
    });

    describe('#initializeOffsitePayment()', () => {
        it('dispatches actions to data store', async () => {
            const payment = getPayment();
            const { methodId, gatewayId } = payment;

            const actions = await from(paymentActionCreator.initializeOffsitePayment({ methodId, gatewayId })(store))
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
            const { methodId, gatewayId } = payment;

            const actions = await from(paymentActionCreator.initializeOffsitePayment({ methodId, gatewayId })(store))
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

        it('dispatches error actions to data store if payment cancelled', async () => {
            const error = new PaymentMethodCancelledError();

            jest.spyOn(paymentRequestSender, 'initializeOffsitePayment')
                .mockResolvedValue(new Promise(noop));

            const cancelPayment = new CancellablePromise<undefined>(new Promise(noop));
            const errorHandler = jest.fn(action => of(action));
            const payment = getPayment();
            const { methodId, gatewayId } = payment;

            const actions = from(paymentActionCreator.initializeOffsitePayment({ methodId, gatewayId, promise: cancelPayment.promise })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            cancelPayment.cancel(error);

            await new Promise(resolve => process.nextTick(resolve));

            expect(errorHandler).toHaveBeenCalled();

            return expect(actions).resolves.toEqual([
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

        it('passes "set_as_default_stored_instrument" flag as null to the paymentRequestTransformer when vaulting, but not as default', () => {
            const payment = getPayment();
            const { methodId, gatewayId } = payment;

            paymentActionCreator.initializeOffsitePayment({ methodId, gatewayId, shouldSaveInstrument: true })(store);

            expect(paymentRequestTransformer.transform).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        formattedPayload: expect.objectContaining({
                            set_as_default_stored_instrument: null,
                        }),
                    }),
                }),
                expect.anything()
            );
        });

        it('passes "set_as_default_stored_instrument" flag as true to the paymentRequestTransformer when vaulting and making default', () => {
            const payment = getPayment();
            const { methodId, gatewayId } = payment;

            paymentActionCreator.initializeOffsitePayment({ methodId, gatewayId, shouldSaveInstrument: true, shouldSetAsDefaultInstrument: true })(store);

            expect(paymentRequestTransformer.transform).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        formattedPayload: expect.objectContaining({
                            set_as_default_stored_instrument: true,
                        }),
                    }),
                }),
                expect.anything()
            );
        });
    });
});
