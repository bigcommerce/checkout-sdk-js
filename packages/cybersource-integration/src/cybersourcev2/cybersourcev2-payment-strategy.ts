import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CybersourceUnifiedCheckoutClient from './cybersource-unified-checkout-client';

export interface WithCyberSourceV2PaymentInitializeOptions {
    cybersourcev2?: {
        containerId: string;
    };
}

export default class CyberSourceV2PaymentStrategy implements PaymentStrategy {
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _unifiedCheckoutClient: CybersourceUnifiedCheckoutClient,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithCyberSourceV2PaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, cybersourcev2 } = options;
        console.log('init');
        if (!cybersourcev2?.containerId) {
            throw new InvalidArgumentError(
                'cybersourcev2.containerId is required to initialize Cybersource Unified Checkout',
            );
        }

        const { getPaymentMethodOrThrow } = this._paymentIntegrationService.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId);
        console.log('paymentMethod', paymentMethod);
        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        await this._unifiedCheckoutClient.load(paymentMethod.config.testMode);
        this._unifiedCheckoutClient.initialize(paymentMethod.clientToken, cybersourcev2.containerId);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        const transientToken = await this._unifiedCheckoutClient.createTransientToken();

        await this._paymentIntegrationService.submitOrder(order, options);
        await this._paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: { nonce: transientToken },
        });
    }

    deinitialize(): Promise<void> {
        this._unifiedCheckoutClient.teardown();

        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
}
