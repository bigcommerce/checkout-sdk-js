import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    createPaymentClient,
    PaymentActionCreator,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from '../..';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import { getApplePay } from '../../payment-methods.mock';

import { ApplePayPaymentStrategy } from '.';
import { getMockApplePaySession } from './apple-pay-payment.mock';
import { SubmitPaymentAction, PaymentActionType } from '../../payment-actions';

describe('ApplePayPaymentStrategy', () => {
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentClient: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let strategy: ApplePayPaymentStrategy;
    let applePaySession: any;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        applePaySession = getMockApplePaySession();
        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: applePaySession,
        });

        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();
        paymentClient = createPaymentClient(store);
        paymentMethod = getApplePay();
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(of(createAction(OrderActionType.SubmitOrderRequested)));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());


        jest.spyOn(requestSender, 'post')
            .mockReturnValue(true);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new ApplePayPaymentStrategy(
            store,
            requestSender,
            orderActionCreator,
            paymentMethodActionCreator,
            paymentActionCreator
        );
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize()).resolves.toEqual(store.getState());
        });
    });

    describe('#execute()', () => {
        it('throws error when order is empty', async () => {
            await expect(strategy.execute({})).rejects.toThrow(new MissingDataError(MissingDataErrorType.MissingOrder));
        });

        it('throws error when payment data is empty', async () => {
            jest.spyOn(store.getState().order, 'getOrderOrThrow')
                .mockReturnValue(getOrder());
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it.only('loads payment method', async () => {
            jest.spyOn(store.getState().order, 'getOrderOrThrow')
                .mockReturnValue(getOrder());

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });
            console.log(payload, ApplePaySession);
            // await expect(strategy.execute(payload)).resolves.toHaveBeenCalledWith(action);
            strategy.execute(payload);
            await new Promise(resolve => process.nextTick(resolve));

            const event = { validationURL: '' } as ApplePayJS.ApplePayValidateMerchantEvent;
            await strategy.applePaySession.onvalidatemerchant(event);
            const authEvent = {
                payment: {
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {}
                    },
                }
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;
            await strategy.applePaySession.onpaymentauthorized(authEvent);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(strategy.applePaySession.completePayment).toHaveBeenCalled();
        });

        // it('validates merchant', async () => {
        //     // todo
        // });

        // it('displays Apple Pay payment sheet', async () => {
        //     // todo
        // });
        //
        // it('validates merchant with BigPay', async () => {
        //     // todo
        // });
        //
        // it('throws error when shopper cancels payment', async () => {
        //     // todo
        // });
        //
        // it('submits payment when shopper authorized', async () => {
        //     // todo
        // });
        //
        // it('passes error to payment sheet when payment fails', async () => {
        //     // todo
        // });
        //
        // it('hides payment sheet and redirect shopper when payment succeeds', async () => {
        //     // todo
        // });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
        });
    });
});

