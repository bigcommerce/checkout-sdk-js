import { of, Observable } from 'rxjs';

import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {
    MissingDataError,
    NotInitializedError,
} from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getCybersource, getPaymentMethodsState } from '../../payment-methods.mock';

import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import { getCreditCardInstrument } from '../../payments.mock';

import {
    CardinalTriggerEvents,
} from './index';

import { CyberSourceCardinal } from './cybersource';
import CyberSourceScriptLoader from './cybersource-script-loader';
import CyberSourceThreeDSecurePaymentProcessor from './cybersource-threedsecure-payment-processor';
import { getCardinalValidatedData, getCybersourceCardinal, getCybersourcePaymentData, getCybersourcePaymentRequestOptions } from './cybersource.mock';

describe('CyberSourceThreeDSecurePaymentProcessor', () => {
    let processor: CyberSourceThreeDSecurePaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let cybersourceScriptLoader: CyberSourceScriptLoader;
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let _paymentActionCreator: PaymentActionCreator;
    let _orderActionCreator: OrderActionCreator;
    let paymentMethodMock: PaymentMethod;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let _orderRequestSender: OrderRequestSender;
    let JPMC: CyberSourceCardinal;

    beforeEach(() => {
        paymentMethodMock = getCybersource();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        _orderRequestSender = new OrderRequestSender(createRequestSender());

        _orderActionCreator = new OrderActionCreator(
            _orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        _paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            _orderActionCreator
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        JPMC = getCybersourceCardinal();
        cybersourceScriptLoader = new CyberSourceScriptLoader(createScriptLoader());

        jest.spyOn(_orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);
        jest.spyOn(_paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());
        jest.spyOn(store, 'dispatch')
            .mockResolvedValue(store.getState());
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);
        jest.spyOn(cybersourceScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(JPMC));

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
        requestSender = createRequestSender();

        processor =  new CyberSourceThreeDSecurePaymentProcessor(
            store,
            _orderActionCreator,
            _paymentActionCreator,
            cybersourceScriptLoader
        );
    });

    it('creates an instance of CyberSourceThreeDSecurePaymentProcessor', () => {
        expect(processor).toBeInstanceOf(CyberSourceThreeDSecurePaymentProcessor);
    });

    describe('#initialize', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getCybersource());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('loads cybersource in test mode if enabled', async () => {
            processor.initialize(paymentMethodMock);
            paymentMethodMock.config.testMode = true;

            expect(cybersourceScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('loads cybersource without test mode if disabled', () => {
            processor.initialize(paymentMethodMock);
            paymentMethodMock.config.testMode = false;

            expect(cybersourceScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('loads cybersource without test mode if disabled', () => {
            try {
                processor.initialize(paymentMethodMock);
                paymentMethodMock.config.testMode = false;
                expect(cybersourceScriptLoader.load).toHaveBeenLastCalledWith(false);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute', () => {
        beforeEach(() => {
            processor.initialize(paymentMethodMock);
        });

        it('executes the processor successfully', async () => {
            try {
                await processor.execute(getCybersourcePaymentData(), getOrderRequestBody(), getCreditCardInstrument());
                expect(_orderActionCreator.submitOrder).toHaveBeenCalledWith(getOrderRequestBody(), getCybersourcePaymentRequestOptions());
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError);
            }
        });

        it('CardinalEvent CardinalValidation failure', async () => {
            try {
                processor.initialize(paymentMethodMock);
                JPMC.on = jest.fn((type, callback) => callback({ActionCode: 'FAILURE', ErrorDescription: ''}));
                expect(await processor.execute(getCybersourcePaymentData(), getOrderRequestBody(), getCreditCardInstrument())).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError);
            }
        });

        it('CardinalEvent CardinalValidateAction NoAction', async () => {
            try {
                processor.initialize(paymentMethodMock);
                JPMC.on = jest.fn((type, callback) => callback({ActionCode: 'ERROR', ErrorNumber: 123}));
                const fn = await JPMC.trigger(CardinalTriggerEvents.BIN_PROCCESS, getCreditCardInstrument().ccNumber);
                expect(fn).toHaveBeenCalledWith(getCardinalValidatedData());
                expect(await processor.initialize(paymentMethodMock)).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('CardinalEvent CardinalValidateAction NoAction', async () => {
            try {
                processor.initialize(paymentMethodMock);
                JPMC.on = jest.fn((type, callback) => callback({ActionCode: 'ERROR', ErrorNumber: 1010}));
                const fn = await JPMC.trigger(CardinalTriggerEvents.BIN_PROCCESS, getCreditCardInstrument().ccNumber);
                expect(fn).toHaveBeenCalledWith(getCardinalValidatedData());
                expect(await processor.initialize(paymentMethodMock)).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('CardinalEvent CardinalValidateAction NoAction', async () => {
            try {
                processor.initialize(paymentMethodMock);
                JPMC.on = jest.fn((type, callback) => callback({ActionCode: 'NOACTION', ErrorNumber: 123}));
                const fn = await JPMC.trigger(CardinalTriggerEvents.BIN_PROCCESS, getCreditCardInstrument().ccNumber);
                expect(fn).toHaveBeenCalledWith(getCardinalValidatedData());
                expect(await processor.initialize(paymentMethodMock)).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('CardinalEvent CardinalValidateAction NoAction', async () => {
            try {
                processor.initialize(paymentMethodMock);
                JPMC.on = jest.fn((type, callback) => callback({ActionCode: 'NOACTION', ErrorNumber: 0}));
                const fn = await JPMC.trigger(CardinalTriggerEvents.BIN_PROCCESS, getCreditCardInstrument().ccNumber);
                expect(fn).toHaveBeenCalledWith(getCardinalValidatedData());
                expect(await processor.initialize(paymentMethodMock)).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('CardinalEvent CardinalValidateAction Success', async () => {
            try {
                processor.initialize(paymentMethodMock);
                JPMC.on = jest.fn((type, callback) => callback({ActionCode: 'SUCCESS'}));
                expect(await processor.execute(getCybersourcePaymentData(), getOrderRequestBody(), getCreditCardInstrument())).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError);
            }
        });

        it('payment action creater submit getCybersourcePaymentDatapayment not initialized', async () => {
            jest.spyOn(JPMC, 'trigger').mockReturnValue(Promise.resolve(false));
            try {
                await processor.execute(getCybersourcePaymentData(), getOrderRequestBody(), getCreditCardInstrument());
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('trigger', async () => {
            try {
                processor.initialize(paymentMethodMock);
                jest.spyOn(processor, 'execute').mockReturnValue(JPMC.trigger);
                expect(await processor.execute(getCybersourcePaymentData(), getOrderRequestBody(), getCreditCardInstrument())).toEqual(store.getState());
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            expect(await processor.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await processor.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });

});
