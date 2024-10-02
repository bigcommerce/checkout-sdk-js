import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { merge, noop } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    FinalizeOrderAction,
    HostedFieldType,
    OrderActionType,
    PaymentActionType,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    SubmitOrderAction,
    SubmitPaymentAction,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    getPaymentMethod,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import CheckoutcomiDealPaymentStrategy from './checkoutcom-ideal-payment-strategy';

describe('CheckoutcomiDealPaymentStrategy', () => {
    let strategy: CheckoutcomiDealPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let paymentMethodMock: PaymentMethod;
    let paymentIntegrationService: PaymentIntegrationService;
    let initializeOptions: PaymentInitializeOptions;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new CheckoutcomiDealPaymentStrategy(paymentIntegrationService);

        formPoster = createFormPoster();

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getPaymentMethod(),
        );

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(submitPaymentAction);

        strategy = new CheckoutcomiDealPaymentStrategy(paymentIntegrationService);
    });

    it('returns checkout state', async () => {
        initializeOptions = {
            creditCard: {
                form: {
                    fields: {
                        [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                        [HostedFieldType.CardName]: { containerId: 'card-name' },
                        [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                    },
                },
            },
            methodId: 'checkoutcom',
        };

        const options = {
            payment: {
                methodId: 'ideal',
                gatewayId: 'checkoutcom',
            },
        };
        const payload = merge(getOrderRequestBody(), options);

        await strategy.initialize(initializeOptions);

        const output = await strategy.execute(getOrderRequestBody());

        await expect(strategy.execute(payload)).resolves.toEqual(output);
    });

    it('submits bic field when methodId is supported', async () => {
        const paymentWithDocument = {
            payment: {
                methodId: 'ideal',
                gatewayId: 'checkoutcom',
                paymentData: {
                    bic: 'TESTCODE',
                },
            },
        };
        const payload = merge(getOrderRequestBody(), paymentWithDocument);
        const options = { methodId: 'ideal' };

        const expectedPayment = merge(payload.payment, {
            paymentData: { formattedPayload: { bic: 'TESTCODE' } },
        });

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
    });

    it('doees not submit bic field when methodId is unsupported', async () => {
        const paymentWithDocument = {
            payment: {
                methodId: 'notideal',
                gatewayId: 'checkoutcom',
                paymentData: {
                    bic: 'TESTCODE',
                },
            },
        };
        const payload = merge(getOrderRequestBody(), paymentWithDocument);
        const options = { methodId: 'ideal' };

        const expectedPayment = merge(payload.payment, {
            paymentData: { formattedPayload: undefined },
        });

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
    });
});
