import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import {
    createCheckoutStore,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
} from '../../../checkout';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import {
    RemoteCheckoutActionCreator,
    RemoteCheckoutActionType,
    RemoteCheckoutRequestSender
} from '../../../remote-checkout';
import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { getCybersource } from '../../payment-methods.mock';

import CyberSourcePaymentProcessor from './cybersource-payment-processor';
import CyberSourcePaymentStrategy from './cybersource-payment-strategy';
import CyberSourceScriptLoader from './cybersource-script-loader';
import CyberSourceThreeDSecurePaymentProcessor from './cybersource-threedsecure-payment-processor';

describe('CyberSourcePaymentStrategy', () => {
    let initializePaymentAction: Observable<Action>;
    let loadPaymentMethodAction: Observable<Action>;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: CyberSourceScriptLoader;
    let submitOrderAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: CyberSourcePaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let cyberSourceThreeDSecurePaymentProcessor: CyberSourceThreeDSecurePaymentProcessor;
    let cyberSourcePaymentProcessor: CyberSourcePaymentProcessor;

    beforeEach(() => {
        paymentMethodMock = { ...getCybersource(), clientToken: 'foo' };
        store = createCheckoutStore(getCheckoutStoreState());
        const paymentClient = createPaymentClient(store);
        const paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new CyberSourceScriptLoader(createScriptLoader());

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        cyberSourceThreeDSecurePaymentProcessor = new CyberSourceThreeDSecurePaymentProcessor(
            store,
            orderActionCreator,
            paymentActionCreator,
            scriptLoader
        );

        cyberSourcePaymentProcessor = new CyberSourcePaymentProcessor(
            store,
            orderActionCreator,
            paymentActionCreator
        );

        strategy = new CyberSourcePaymentStrategy(
            store,
            paymentMethodActionCreator,
            cyberSourceThreeDSecurePaymentProcessor,
            cyberSourcePaymentProcessor
        );

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
            },
        });

        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: paymentMethodMock.id }));
        initializePaymentAction = of(createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(cyberSourcePaymentProcessor, 'execute').mockReturnValue(orderActionCreator.submitOrder(payload));
        jest.spyOn(cyberSourceThreeDSecurePaymentProcessor, 'initialize').mockReturnValue(store.getState());
        jest.spyOn(cyberSourceThreeDSecurePaymentProcessor, 'execute').mockReturnValue(store.getState());
        jest.spyOn(cyberSourceThreeDSecurePaymentProcessor, 'finalize').mockReturnValue(new OrderFinalizationNotRequiredError());
        jest.spyOn(cyberSourceThreeDSecurePaymentProcessor, 'deinitialize').mockReturnValue(store.getState());
    });

    describe('#initialize', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });
        });

        it('initializes strategy successfully', () => {
            expect(cyberSourceThreeDSecurePaymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('initializes strategy successfully with is3dsEnabled value is false', async () => {
            paymentMethod = { ...getCybersource() };
            paymentMethod.config.is3dsEnabled = false;

            jest.spyOn(cyberSourcePaymentProcessor, 'initialize').mockReturnValue(store.getState());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethod);

            await strategy.initialize({ methodId: paymentMethodMock.id });

            expect(cyberSourcePaymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('throws data missing error when initializing', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            try {
                await strategy.initialize({ methodId: paymentMethodMock.id });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute', () => {
        it('throws error to inform that order finalization is not required and cannot be execute', async () => {
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('throws data missing error when executing', async () => {
            payload.payment = undefined;

            await strategy.initialize({ methodId: paymentMethodMock.id });
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('executes the strategy successfully', async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });

            await strategy.execute(payload);

            expect(cyberSourceThreeDSecurePaymentProcessor.execute).toHaveBeenCalledTimes(1);
        });
    });

    describe('#finalize()', () => {
        it('finalize strategy successfully', async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });

            await strategy.finalize();

            expect(cyberSourceThreeDSecurePaymentProcessor.finalize).toHaveBeenCalledTimes(1);
        });

        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('#deinitialize()', () => {
        it('deinitialize strategy successfully', async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });

            await strategy.deinitialize();

            expect(cyberSourceThreeDSecurePaymentProcessor.deinitialize).toHaveBeenCalledTimes(1);
        });

        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.deinitialize();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });
});
