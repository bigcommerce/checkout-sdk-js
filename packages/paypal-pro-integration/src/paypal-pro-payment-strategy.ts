import { CardinalThreeDSecureFlow } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStatusTypes,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class PaypalProPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        protected paymentIntegrationService: PaymentIntegrationService,
        private threeDSecureFlow: CardinalThreeDSecureFlow,
    ) {
        super(paymentIntegrationService);
    }

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        await super.initialize(options);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(options.methodId);

        if (paymentMethod.config.is3dsEnabled) {
            await this.threeDSecureFlow.prepare(paymentMethod);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment: { methodId = '' } = {} } = payload;

        const state = this.paymentIntegrationService.getState();

        if (state.getPaymentStatus() === PaymentStatusTypes.ACKNOWLEDGE) {
            await this.paymentIntegrationService.submitOrder(
                {
                    ...payload,
                    payment: { methodId },
                },
                options,
            );

            return Promise.resolve();
        }

        if (state.getPaymentMethodOrThrow(methodId).config.is3dsEnabled) {
            return this.threeDSecureFlow.start(
                super.execute.bind(this),
                payload,
                options,
                this._hostedForm,
            );
        }

        return super.execute(payload, options);
    }
}
