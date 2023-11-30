import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { FieldType, TDCustomCheckoutSDK } from './td-online-mart';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';

export default class TDOnlineMartPaymentStrategy implements PaymentStrategy {
    private tdOnlineMartClient?: TDCustomCheckoutSDK;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private tdOnlineMartScriptLoader: TDOnlineMartScriptLoader,
    ) {}

    async initialize(options?: PaymentInitializeOptions): Promise<void> {
        console.log(options, this.paymentIntegrationService);

        this.tdOnlineMartClient = await this.loadTDOnlineMartJs();

        this.mountHostedFields();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        console.log('payment', payload);
        console.log('options', options);

        await Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await Promise.resolve();
    }

    private mountHostedFields(): void {
        if (!this.tdOnlineMartClient) {
            return;
        }

        const cardNumber = this.tdOnlineMartClient.create(FieldType.CARD_NUMBER);
        const cvv = this.tdOnlineMartClient.create(FieldType.CVV);
        const expiry = this.tdOnlineMartClient.create(FieldType.EXPIRY);

        cardNumber.mount('#tdonlinemart-ccNumber');
        cvv.mount('#tdonlinemart-ccCvv');
        expiry.mount('#tdonlinemart-ccExpiry');
    }

    private async loadTDOnlineMartJs(): Promise<TDCustomCheckoutSDK> {
        if (this.tdOnlineMartClient) {
            return this.tdOnlineMartClient;
        }

        return this.tdOnlineMartScriptLoader.load();
    }
}
