/* eslint-disable @typescript-eslint/naming-convention */
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
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

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        console.log(options, this.paymentIntegrationService);

        const { methodId } = options;

        this.tdOnlineMartClient = await this.loadTDOnlineMartJs();

        this.mountHostedFields(methodId);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const cartId = this.paymentIntegrationService.getState().getCartOrThrow().id;

        const paymentToken = await this.getToken();

        if (!paymentToken) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        await this.paymentIntegrationService.submitPayment({
            methodId: payment.methodId,
            paymentData: {
                formattedPayload: {
                    cart_id: cartId,
                    credit_card_token: {
                        token: paymentToken,
                    },
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    // vault_payment_instrument: shouldSaveInstrument || null,
                    // set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                },
            },
        });

        await Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await Promise.resolve();
    }

    private mountHostedFields(methodId: string): void {
        const cardNumber = this.getTDOnlineMartClient().create(FieldType.CARD_NUMBER);
        const cvv = this.getTDOnlineMartClient().create(FieldType.CVV);
        const expiry = this.getTDOnlineMartClient().create(FieldType.EXPIRY);

        cardNumber.mount(`#${methodId}-ccNumber`);
        cvv.mount(`#${methodId}-ccCvv`);
        expiry.mount(`#${methodId}-ccExpiry`);
    }

    private async loadTDOnlineMartJs(): Promise<TDCustomCheckoutSDK> {
        if (this.tdOnlineMartClient) {
            return this.tdOnlineMartClient;
        }

        return this.tdOnlineMartScriptLoader.load();
    }

    private getToken(): Promise<string | undefined> {
        return new Promise((resolve) => {
            this.getTDOnlineMartClient().createToken((result) => {
                if (result.error) {
                    resolve(undefined);
                } else {
                    resolve(result.token);
                }
            });
        });
    }

    private getTDOnlineMartClient(): TDCustomCheckoutSDK {
        if (!this.tdOnlineMartClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.tdOnlineMartClient;
    }
}
