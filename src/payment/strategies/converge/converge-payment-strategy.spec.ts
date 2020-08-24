import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../..';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { getResponse } from '../../../common/http-request/responses.mock';
import { HostedFormFactory } from '../../../hosted-form';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderPaymentRequestBody, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getConverge } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import * as paymentStatusTypes from '../../payment-status-types';
import { getErrorPaymentResponseBody, getPayment } from '../../payments.mock';
import { CreditCardPaymentStrategy } from '../credit-card';

import { MissingDataError, MissingDataErrorType, RequestError } from './../../../common/error/errors';
import { PaymentInitializeOptions } from './../../payment-request-options';
import { ConvergeSDK } from './converge';
import ConvergePaymentStrategy from './converge-payment-strategy';
import ConvergeScriptLoader from './converge-script-loader';
import { getConvergeConfirmPaymentResponse, getConvergeMock } from './converge.mock';

describe('ConvergeaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let hostedFormFactory: HostedFormFactory;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let store: CheckoutStore;
    let strategy: ConvergePaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let convergeScriptLoader: ConvergeScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let scriptLoader: ScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        scriptLoader = createScriptLoader();

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentMethodMock = getConverge();

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));

        formPoster = createFormPoster();
        store = createCheckoutStore(getCheckoutStoreState());
        hostedFormFactory = {} as HostedFormFactory;
        convergeScriptLoader = new ConvergeScriptLoader(scriptLoader);

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation((_url, _data, callback = () => {}) => callback());

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        strategy = new ConvergePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
            formPoster,
            convergeScriptLoader,
            paymentMethodActionCreator
        );
    });

    it('creates an instance of ConvergePaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(ConvergePaymentStrategy);
    });

    describe('#initialize()', () => {
        let initializeOptions: PaymentInitializeOptions;

        beforeEach(() => {
            initializeOptions = { methodId: 'converge' };
            jest.spyOn(convergeScriptLoader, 'load')
                .mockResolvedValue(getConvergeMock());
        });

        it('loads converge script', async () => {
            paymentMethodMock.initializationData.is3dsV2Enabled = true;
            paymentMethodMock.clientToken = 'myToken';

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await expect(strategy.initialize(initializeOptions)).resolves.toBe(store.getState());

            expect(convergeScriptLoader.load).toHaveBeenCalled();
        });

        it('throws error if client token is missing', async () => {
            paymentMethodMock.initializationData.is3dsV2Enabled = true;

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('loads a single instance of Elavon3DSWebSDK', async () => {
            paymentMethodMock.initializationData.is3dsV2Enabled = true;
            paymentMethodMock.clientToken = 'myToken';

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await expect(strategy.initialize(initializeOptions)).resolves.toBe(store.getState());
            await expect(strategy.initialize(initializeOptions)).resolves.toBe(store.getState());

            expect(convergeScriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('does not load converge if initialization options are not provided', () => {
            initializeOptions.methodId = '';

            const promise = strategy.initialize(initializeOptions);

            return expect(promise).rejects.toThrow(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let initializeOptions: PaymentInitializeOptions;
        const convergeMock: ConvergeSDK = getConvergeMock();

        beforeEach(() => {
            initializeOptions = { methodId: 'converge' };
            orderRequestBody = {
                ...getOrderRequestBody(),
                payment: {
                    ...getPayment() as OrderPaymentRequestBody,
                    methodId: 'converge',
                },
            };

            jest.spyOn(convergeScriptLoader, 'load')
                .mockResolvedValue(convergeMock);
        });

        it('submits order with payment data to sdk v2', async () => {
            paymentMethodMock.initializationData.is3dsV2Enabled = true;
            paymentMethodMock.clientToken = 'myToken';

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            convergeMock.web3dsFlow = jest.fn().mockResolvedValue(getConvergeConfirmPaymentResponse());

            await strategy.initialize(initializeOptions);

            await strategy.execute(omit(orderRequestBody, 'order'), initializeOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), initializeOptions);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'converge',
                paymentData: {
                    formattedPayload: {
                        authenticated: true,
                        threeDSServerTransID: '9e7bbadd-f37e-4988-8b73-dd0887c0b834',
                        dsTransID: '9b7c00f0-a0bc-47a6-8f2f-b97445ccda49',
                        transStatus: 'Y',
                        credit_card: {
                            account_name: 'BigCommerce',
                            month: '10',
                            number: '4111111111111111',
                            verification_value: '123',
                            year: '2020',
                        },
                    },
                },
            });
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
        });

        it('posts 3ds data to Converge if 3ds is enabled to sdk v2', async () => {
            paymentMethodMock.initializationData.is3dsV2Enabled = true;
            paymentMethodMock.clientToken = 'myToken';

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            convergeMock.web3dsFlow = jest.fn().mockResolvedValue(getConvergeConfirmPaymentResponse());

            await strategy.initialize(initializeOptions);

            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                    callback_url: 'https://callback/url',
                    payer_auth_request: 'payer_auth_request',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            strategy.execute(orderRequestBody);

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
                PaReq: 'payer_auth_request',
                TermUrl: 'https://callback/url',
                MD: 'merchant_data',
            });
        });

        it('submits order without payment data', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), initializeOptions);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submits payment separately', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(orderRequestBody.payment);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('returns checkout state', async () => {
            await expect(strategy.execute(orderRequestBody)).resolves.toBe(store.getState());
        });

        it('posts 3ds data to Converge if 3ds is enabled', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                    callback_url: 'https://callback/url',
                    payer_auth_request: 'payer_auth_request',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            strategy.execute(orderRequestBody);

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
                PaReq: 'payer_auth_request',
                TermUrl: 'https://callback/url',
                MD: 'merchant_data',
            });
        });

        it('does not load converge if 3ds is not required', async () => {
            const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, response)));

            await expect(strategy.execute(orderRequestBody)).rejects.toThrow(RequestError);
            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('is special type of credit card strategy', () => {
            expect(strategy)
                .toBeInstanceOf(CreditCardPaymentStrategy);
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });

        it('finalizes order if order is created and payment is finalized', async () => {
            const state = store.getState();

            jest.spyOn(state.order, 'getOrder')
                .mockReturnValue(getOrder());

            jest.spyOn(state.payment, 'getPaymentStatus')
                .mockReturnValue(paymentStatusTypes.FINALIZE);

            await strategy.finalize();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('does not finalize order if order is not created', async () => {
            const state = store.getState();

            jest.spyOn(state.order, 'getOrder')
                .mockReturnValue(null);

            await expect(strategy.finalize()).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('does not finalize order if order is not finalized', async () => {
            const state = store.getState();

            jest.spyOn(state.payment, 'getPaymentStatus')
                .mockReturnValue(paymentStatusTypes.INITIALIZE);

            await expect(strategy.finalize()).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
        });
    });
});
