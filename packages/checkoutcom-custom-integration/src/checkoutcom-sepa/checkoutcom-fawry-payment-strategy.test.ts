import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { merge, noop } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    FinalizeOrderAction,
    OrderActionType,
    PaymentActionType,
    PaymentIntegrationService,
    SubmitOrderAction,
    SubmitPaymentAction,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    getPaymentMethod,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import CheckoutComFawryPaymentStrategy from './checkoutcom-fawry-payment-strategy';

describe('CheckoutcomFawryPaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let strategy: CheckoutComFawryPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getPaymentMethod(),
        );

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(submitPaymentAction);

        strategy = new CheckoutComFawryPaymentStrategy(paymentIntegrationService);
    });

    it('returns checkout state', async () => {
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

        const output = await strategy.execute(merge(getOrderRequestBody(), payload));

        await expect(strategy.execute(payload)).resolves.toEqual(output);
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

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
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

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
    });
});
