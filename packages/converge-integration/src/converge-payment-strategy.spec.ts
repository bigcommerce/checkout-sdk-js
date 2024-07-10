import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { merge, noop, omit } from 'lodash';
import { Observable, of } from 'rxjs';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    FinalizeOrderAction,
    OrderActionType,
    OrderFinalizationNotRequiredError,
    PaymentActionType,
    PaymentIntegrationService,
    PaymentStatusTypes,
    RequestError,
    SubmitOrderAction,
    SubmitPaymentAction,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrder,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ConvergePaymentStrategy from './converge-payment-strategy';

describe('ConvergeaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let strategy: ConvergePaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }),
        );

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(submitPaymentAction);

        strategy = new ConvergePaymentStrategy(paymentIntegrationService, formPoster);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'converge' };

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
            omit(payload, 'payment'),
            options,
        );
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'converge' };

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(payload.payment);
    });

    it('posts 3ds data to Converge if 3ds is enabled', async () => {
        const error = new RequestError(
            getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [{ code: 'three_d_secure_required' }],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                    callback_url: 'https://callback/url',
                    payer_auth_request: 'payer_auth_request',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }),
        );

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
            throw error;
        });

        strategy.execute(getOrderRequestBody());

        await new Promise((resolve) => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
            PaReq: 'payer_auth_request',
            TermUrl: 'https://callback/url',
            MD: 'merchant_data',
        });
    });

    it('does not post 3ds data to Converge if 3ds is not enabled', async () => {
        const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
            throw response;
        });

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(error).toBeInstanceOf(RequestError);
            expect(formPoster.postForm).not.toHaveBeenCalled();
        }
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getOrder').mockReturnValue(getOrder());

        jest.spyOn(state, 'getPaymentStatus').mockReturnValue(PaymentStatusTypes.FINALIZE);

        await strategy.finalize();

        expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalled();
    });

    it('does not finalize order if order is not created', async () => {
        const state = paymentIntegrationService.getState();

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(state, 'getOrder').mockReturnValue(null);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(paymentIntegrationService.finalizeOrder).not.toHaveBeenCalled();

            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('does not finalize order if order is not finalized', async () => {
        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getPaymentStatus').mockReturnValue(PaymentStatusTypes.INITIALIZE);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(paymentIntegrationService.finalizeOrder).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('throws error if order is missing', async () => {
        const state = paymentIntegrationService.getState();

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(state, 'getOrder').mockReturnValue(null);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('is special type of credit card strategy', () => {
        expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });
});
