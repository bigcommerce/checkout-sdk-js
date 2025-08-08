import {
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStatusTypes,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class OffsitePaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const orderPayload = this._shouldSubmitFullPayload(payment) ? payload : order;
        const paymentData = payment && payment.paymentData;
        const instrumentId =
            (paymentData && isVaultedInstrument(paymentData) && paymentData.instrumentId) ||
            undefined;
        const shouldSaveInstrument =
            (paymentData &&
                isHostedInstrumentLike(paymentData) &&
                paymentData.shouldSaveInstrument) ||
            undefined;
        const shouldSetAsDefaultInstrument =
            (paymentData &&
                isHostedInstrumentLike(paymentData) &&
                paymentData.shouldSetAsDefaultInstrument) ||
            undefined;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, gatewayId } = payment;

        await this._paymentIntegrationService.submitOrder(orderPayload, options);
        await this._paymentIntegrationService.initializeOffsitePayment({
            methodId,
            gatewayId,
            instrumentId,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        });
    }

    async finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const order = state.getOrder();
        const status = state.getPaymentStatus();

        if (
            order &&
            (status === PaymentStatusTypes.ACKNOWLEDGE || status === PaymentStatusTypes.FINALIZE)
        ) {
            await this._paymentIntegrationService.finalizeOrder(options);

            return;
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _shouldSubmitFullPayload(payment?: OrderPaymentRequestBody): boolean {
        // FIXME: A temporary workaround to support offsite payment methods
        // where their return URL needs to be provided by the core app.
        if (!payment) {
            return false;
        }

        return payment.gatewayId === 'adyen' || payment.gatewayId === 'barclaycard';
    }
}
