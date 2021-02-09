import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, createStylesheetLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { getCustomer } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import { PaymentInitializeOptions } from '../../payment-request-options';
import { getClientMock, getDigitalRiverJSMock, getDigitalRiverPaymentMethodMock, getInitializeOptionsMock } from '../digitalriver/digitalriver.mock';

import { OnCancelOrErrorResponse, OnSuccessResponse } from './digitalriver';
import DigitalRiverPaymentStrategy from './digitalriver-payment-strategy';
import DigitalRiverScriptLoader from './digitalriver-script-loader';

describe('DigitalRiverPaymentStrategy', () => {
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let payload: OrderRequestBody;
    let store: CheckoutStore;
    let loadPaymentMethodAction: Observable<Action>;
    let strategy: DigitalRiverPaymentStrategy;
    let digitalRiverScriptLoader: DigitalRiverScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let orderActionCreator: OrderActionCreator;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        const stylesheetLoader = createStylesheetLoader();
        paymentMethodMock = {...getDigitalRiverPaymentMethodMock(), clientToken: JSON.stringify(getClientMock())};
        digitalRiverScriptLoader = new DigitalRiverScriptLoader(scriptLoader, stylesheetLoader);
        store = createCheckoutStore(getCheckoutStoreState());
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {methodId: paymentMethodMock.id}));
        paymentMethodActionCreator = {} as PaymentMethodActionCreator;
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        jest.spyOn(store, 'dispatch');

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        strategy = new DigitalRiverPaymentStrategy(
            store,
            paymentMethodActionCreator,
            orderActionCreator,
            digitalRiverScriptLoader
        );

    });

    describe('#initialize()', () => {
        const digitalRiverLoadResponse = getDigitalRiverJSMock();
        const digitalRiverComponent = digitalRiverLoadResponse.createDropin(expect.any(Object));
        const customer = getCustomer();
        let options: PaymentInitializeOptions;
        let onErrorCallback: (error: OnCancelOrErrorResponse) => {};
        let onSuccessCallback: (data?: OnSuccessResponse) => {};

        beforeEach(() => {
            jest.spyOn(store.getState().billingAddress, 'getBillingAddressOrThrow').mockReturnValue(getBillingAddress());
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
            jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(Promise.resolve(digitalRiverLoadResponse));
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockReturnValue(digitalRiverComponent);
            options = getInitializeOptionsMock();
        });

        it('returns the state', () => {
            return expect(strategy.initialize(options)).resolves.toBe(store.getState());
        });

        it('loads DigitalRiver script', async () => {
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();
        });

        it('calls onSuccess callback from DigitalRiver', async () => {
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(({onSuccess}) => {
                onSuccessCallback = onSuccess;

                return digitalRiverComponent;
            });

            await strategy.initialize(options);
            onSuccessCallback({
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            });

            expect(digitalRiverLoadResponse.createDropin).toBeCalled();
        });

        it('calls onReady callback from DigitalRiver', async () => {
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(({onReady}) => {
                onReady({
                    paymentMethodTypes: ['creditCard', 'paypal'],
                });

                return digitalRiverComponent;
            });

            await strategy.initialize(options);

            expect(digitalRiverLoadResponse.createDropin).toBeCalled();
        });

        it('calls onError callback from DigitalRiver', async () => {
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(({onError}) => {
                onErrorCallback = onError;

                return digitalRiverComponent;
            });

            await strategy.initialize(options);
            onErrorCallback({
                errors: [{
                    code: 'code',
                    message: 'message',
                }],
            });

            expect(options.digitalriver?.onError).toBeCalled();
            expect(digitalRiverLoadResponse.createDropin).toBeCalled();
        });

        it('throws an error when load response is empty or not provided', () => {
            jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(Promise.resolve(undefined));

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('throws an error when DigitalRiver options is not provided', () => {
            const error = new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            options.digitalriver = undefined;

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(error);
        });

        it('throws an error when DigitalRiver clientToken is not provided', () => {
            const error = new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            paymentMethodMock = {...getDigitalRiverPaymentMethodMock(), clientToken: ''};
            loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {methodId: paymentMethodMock.id}));

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(error);
        });

        it('throws an error when DigitalRiver clientToken is not receiving correct data ', () => {
            const error = new Error('Unexpected token o in JSON at position 0');
            paymentMethodMock = {...getDigitalRiverPaymentMethodMock(), clientToken: 'ok'};
            loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {methodId: paymentMethodMock.id}));

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(error);
        });

        it('throws an error when data on onSuccess event is not provided', async () => {
            const expectedError = new InvalidArgumentError('Unable to initialize payment because success argument is not provided.');
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(({onSuccess}) => {
                try {
                    onSuccessCallback = onSuccess;
                } catch (error) {
                    expect(error).toEqual(expectedError);
                }

                return digitalRiverComponent;
            });

            await strategy.initialize(options);
            onSuccessCallback(undefined);

            expect(options.digitalriver?.onError).toBeCalled();
            expect(digitalRiverLoadResponse.createDropin).toBeCalled();
        });
    });

    describe('#execute()', () => {
        let submitOrderAction: Observable<SubmitOrderAction>;
        let options: PaymentInitializeOptions;
        let onSuccessCallback: (data: OnSuccessResponse) => {};
        const digitalRiverLoadResponse = getDigitalRiverJSMock();
        const digitalRiverComponent = digitalRiverLoadResponse.createDropin(expect.any(Object));

        beforeEach(() => {
            jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(Promise.resolve(digitalRiverLoadResponse));
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockReturnValue(digitalRiverComponent);
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            jest.spyOn(orderActionCreator, 'submitOrder')
                .mockReturnValue(submitOrderAction);
            options = getInitializeOptionsMock();
            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    useStoreCredit: false,
                    order: {
                        order: 'fake',
                    },
                    payment: {
                        methodId: 'digitalriver',
                        paymentData: {instrumentId: '123', shouldSetAsDefaultInstrument: true},
                    },
                },
            });
        });

        it('returns the state', async () => {
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(({onSuccess}) => {
                onSuccessCallback = onSuccess;

                return digitalRiverComponent;
            });

            await strategy.initialize(options);
            onSuccessCallback({
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            });

            expect(await strategy.execute(payload)).toEqual(store.getState());
        });

        it('throws an error when payment is not provided', async () => {
            const error = new Error('Unable to proceed because payload payment argument is not provided.');
            payload.payment = undefined;

            const promise = strategy.execute(payload, undefined);

            return expect(promise).rejects.toThrow(error);
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('returns the state', async () => {
            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });
});
