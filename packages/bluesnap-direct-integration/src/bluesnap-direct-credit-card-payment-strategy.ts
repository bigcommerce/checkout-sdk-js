import {
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class BlueSnapDirectCreditCardPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    execute(): Promise<void> {
        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.resolve();
    }

    initialize(): Promise<void> {
        this._paymentIntegrationService.getState();

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
