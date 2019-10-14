import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import {
    createCheckoutStore,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
} from '../../../checkout';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import {
    OrderActionCreator,
    OrderRequestSender,
} from '../../../order';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection/index';
import { PaymentMethodActionCreator, PaymentMethodActionType, PaymentMethodRequestSender, PaymentRequestSender } from '../../index';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import { getCybersource } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody, getPayment, getVaultedInstrument } from '../../payments.mock';
import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlow
} from '../cardinal';

describe('CardinalThreeDSecureFlow', () => {
    let loadPaymentMethodAction: Observable<Action>;
    let cardinalClient: CardinalClient;
    let payment: Payment;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let scriptLoader: CardinalScriptLoader;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let store: CheckoutStore;
    let paymentMethodMock: PaymentMethod;
    let requestError: RequestError;
    let cardinalFlow: CardinalThreeDSecureFlow;

    beforeEach(() => {
        paymentMethodMock = { ...getCybersource(), clientToken: 'foo' };
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        scriptLoader = new CardinalScriptLoader(createScriptLoader());
        cardinalClient = new CardinalClient(scriptLoader);

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(
                createSpamProtection(createScriptLoader())
            )
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );

        cardinalFlow = new CardinalThreeDSecureFlow(
            store,
            paymentActionCreator,
            paymentMethodActionCreator,
            cardinalClient
        );

        payment = {
            ...getPayment(),
            methodId: paymentMethodMock.id,
            gatewayId: paymentMethodMock.gateway,
        };

        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: paymentMethodMock.id }));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(cardinalClient, 'initialize').mockReturnValue(Promise.resolve());
        jest.spyOn(cardinalClient, 'configure').mockReturnValue(Promise.resolve());
    });

    describe('#prepare', () => {
        it('initializes Cardinal correctly', async () => {
            await cardinalFlow.prepare(paymentMethodMock.id);

            expect(cardinalClient.initialize).toHaveBeenCalledWith('cybersource', true);
            expect(cardinalClient.configure).toHaveBeenCalledWith(paymentMethodMock.clientToken);
        });

        it('does not call loadPaymentMethod if already did', async () => {
            await cardinalFlow.prepare(paymentMethodMock.id);
            await cardinalFlow.prepare(paymentMethodMock.id);

            expect(paymentMethodActionCreator.loadPaymentMethod).toBeCalledTimes(1);
        });

        it('throws missing data error when payment method is not defined', async () => {
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                .mockReturnValue(of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, undefined)));

            try {
                await cardinalFlow.prepare(paymentMethodMock.id);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws missing data error when client token is not defined', async () => {
            paymentMethodMock.clientToken = undefined;
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                .mockReturnValue(of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock)));

            try {
                await cardinalFlow.prepare(paymentMethodMock.id);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#start', () => {
        beforeEach(async () => {
            requestError = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                    callback_url: '',
                    payer_auth_request: '',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }));

            jest.spyOn(cardinalClient, 'configure').mockReturnValue(Promise.resolve());
            jest.spyOn(cardinalClient, 'runBinProcess').mockReturnValue(Promise.resolve());

            await cardinalFlow.prepare(paymentMethodMock.id);
        });

        it('completes the purchase correctly if card is not enrolled', async () => {
            jest.spyOn(cardinalClient, 'getThreeDSecureData');

            await cardinalFlow.start(payment);

            expect(cardinalClient.getThreeDSecureData).not.toHaveBeenCalled();
        });

        it('completes the purchase correctly if card is enrolled', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
            jest.spyOn(cardinalClient, 'getThreeDSecureData').mockReturnValue(Promise.resolve('token'));

            await cardinalFlow.start(payment);

            expect(cardinalClient.getThreeDSecureData).toHaveBeenCalled();
        });

        it('does not complete the purchase if there was an error', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, new Error('Custom Error'))));

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Custom Error');
            }
        });

        it('throws data missing error when payment data is undefined', async () => {
            payment = {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
            };

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if payment data is not a credit card or vaulted instrument', async () => {
            payment = {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
                paymentData: {
                    nonce: 'string',
                },
            };

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if client token is undefined', async () => {
            cardinalFlow = new CardinalThreeDSecureFlow(
                store,
                paymentActionCreator,
                paymentMethodActionCreator,
                cardinalClient
            );

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if order data is undefined', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));

            store = createCheckoutStore(getCheckoutStoreState());

            cardinalFlow = new CardinalThreeDSecureFlow(
                store,
                paymentActionCreator,
                paymentMethodActionCreator,
                cardinalClient
            );

            await cardinalFlow.prepare(paymentMethodMock.id);

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if billing data is undefined', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));

            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: undefined,
            });

            cardinalFlow = new CardinalThreeDSecureFlow(
                store,
                paymentActionCreator,
                paymentMethodActionCreator,
                cardinalClient
            );

            await cardinalFlow.prepare(paymentMethodMock.id);

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if checkout data is undefined', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));

            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                checkout: undefined,
            });

            cardinalFlow = new CardinalThreeDSecureFlow(
                store,
                paymentActionCreator,
                paymentMethodActionCreator,
                cardinalClient
            );

            await cardinalFlow.prepare(paymentMethodMock.id);

            try {
                await cardinalFlow.start(payment);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('uses vaulted instrument as payment Data', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
            jest.spyOn(cardinalClient, 'getThreeDSecureData').mockReturnValue(Promise.resolve('token'));

            payment = {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
                paymentData: getVaultedInstrument(),
            };

            await cardinalFlow.start(payment);

            expect(cardinalClient.getThreeDSecureData).toHaveBeenCalled();
        });
    });
});
