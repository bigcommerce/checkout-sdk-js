import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, noop } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
    InternalCheckoutSelectors,
} from '../../../../checkout';
import { getCheckoutStoreState } from '../../../../checkout/checkouts.mock';
import { HostedFormFactory } from '../../../../hosted-form';
import {
    FinalizeOrderAction,
    OrderActionCreator,
    OrderActionType,
    OrderRequestSender,
    SubmitOrderAction,
} from '../../../../order';
import { getOrderRequestBody } from '../../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../../spam-protection';
import PaymentActionCreator from '../../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../../payment-actions';
import { getPaymentMethod } from '../../../payment-methods.mock';
import PaymentRequestSender from '../../../payment-request-sender';
import PaymentRequestTransformer from '../../../payment-request-transformer';

import CheckoutcomFawryPaymentStrategy from './checkoutcom-fawry-payment-strategy';

describe('CheckoutcomFawryPaymentStrategy', () => {
    let formFactory: HostedFormFactory;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let orderRequestSender: OrderRequestSender;
    let strategy: CheckoutcomFawryPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let state: InternalCheckoutSelectors;

    beforeEach(() => {
        requestSender = createRequestSender();
        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        formPoster = createFormPoster();
        formFactory = new HostedFormFactory(store);
        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        state = store.getState();

        jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            getPaymentMethod(),
        );

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );

        jest.spyOn(orderActionCreator, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

        strategy = new CheckoutcomFawryPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formFactory,
        );
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });

    it('submits customer fields when methodId is supported', async () => {
        const paymentWithDocument = {
            payment: {
                methodId: 'fawry',
                gatewayId: 'checkoutcom',
                paymentData: {
                    customerMobile: '1234567890',
                    customerEmail: 'test@test.com',
                },
            },
        };
        const payload = merge(getOrderRequestBody(), paymentWithDocument);
        const options = { methodId: 'fawry' };

        const expectedPayment = merge(payload.payment, {
            paymentData: {
                formattedPayload: { customerMobile: '1234567890', customerEmail: 'test@test.com' },
            },
        });

        await strategy.execute(payload, options);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });

    it('doees not submit customer fields when methodId is unsupported', async () => {
        const paymentWithDocument = {
            payment: {
                methodId: 'notfawry',
                gatewayId: 'checkoutcom',
                paymentData: {
                    customerMobile: '1234567890',
                    customerEmail: 'test@test.com',
                },
            },
        };
        const payload = merge(getOrderRequestBody(), paymentWithDocument);
        const options = { methodId: 'fawry' };

        const expectedPayment = merge(payload.payment, {
            paymentData: { formattedPayload: undefined },
        });

        await strategy.execute(payload, options);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });
});
