import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import TDOnlineMartScriptLoader from './td-online-mart-script-loader';

//@ts-ignore;
export default class TDOnlineMartPaymentStrategy implements PaymentStrategy {
    private tdOnlineMartClient: any;
    private cardNumberValid: boolean | undefined;
    private cardCvvValid: boolean | undefined;
    private cardExpiryValid: boolean | undefined;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private tdOnlineMartScriptLoader: TDOnlineMartScriptLoader,
    ) {}

    async initialize(options?: PaymentInitializeOptions): Promise<void> {
        console.log(options, this.paymentIntegrationService);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        await this.loadTDOnlineMartJs();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        this.tdOnlineMartClient = (window as any).customcheckout();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call

        const cardNumber = this.tdOnlineMartClient.create('card-number');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const cvv = this.tdOnlineMartClient.create('cvv');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const expiry = this.tdOnlineMartClient.create('expiry');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        // cardNumber.mount('#td-card-number');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        cardNumber.mount('#tdonlinemart-ccNumber');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        cvv.mount('#tdonlinemart-ccCvv');
        // cvv.mount('#td-cvv');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        expiry.mount('#tdonlinemart-ccExpiry');
        // expiry.mount('#td-expiration-date');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        this.tdOnlineMartClient.on('complete', (event: any) => {
            console.log('event', event);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (event.field === 'card-number') {
                this.cardNumberValid = true;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            } else if (event.field === 'cvv') {
                this.cardCvvValid = true;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            } else if (event.field === 'expiry') {
                this.cardExpiryValid = true;
            }
        });

        await Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        console.log('payment', payload);
        console.log('options', options);
        console.log('payment.paymentData', payload);

        if (
            this.cardNumberValid === true &&
            this.cardCvvValid === true &&
            this.cardExpiryValid === true
        ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            this.tdOnlineMartClient.createToken((result: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (result.error) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    console.log(result.error.message);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    console.log(result.token);
                }
            });
        }

        await Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await Promise.resolve();
    }

    private async loadTDOnlineMartJs(): Promise<unknown> {
        if (this.tdOnlineMartClient) {
            return Promise.resolve(this.tdOnlineMartClient);
        }

        return this.tdOnlineMartScriptLoader.load();
    }
}
