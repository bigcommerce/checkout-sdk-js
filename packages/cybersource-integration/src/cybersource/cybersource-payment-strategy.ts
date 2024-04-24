import { CardinalThreeDSecureFlow } from '../../../core/src/payment/strategies/cardinal';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class CyberSourcePaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        paymentIntegrationService: PaymentIntegrationService,
        private _threeDSecureFlow: CardinalThreeDSecureFlow,
    ) {
        super(paymentIntegrationService);
    }

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        await super.initialize(options);

        const {
            getPaymentMethodOrThrow,
        } = this._paymentIntegrationService.getState();
        const paymentMethod = getPaymentMethodOrThrow(options.methodId);

        if (paymentMethod.config.is3dsEnabled) {
            await this._threeDSecureFlow.prepare(paymentMethod);
        }
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<void> {
        const { payment: { methodId = '' } = {} } = payload;
        const {
            getPaymentMethodOrThrow,
        } = this._paymentIntegrationService.getState();

        if (getPaymentMethodOrThrow(methodId).config.is3dsEnabled) {
            return this._threeDSecureFlow.start(
                super.execute.bind(this),
                payload,
                options,
                this._hostedForm,
            );
        }

        return super.execute(payload, options);
    }
}
