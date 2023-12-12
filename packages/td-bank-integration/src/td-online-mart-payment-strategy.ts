import {
    InvalidArgumentError,
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

import { FieldType, TDCustomCheckoutSDK, TdOnlineMartElement } from './td-online-mart';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';

export default class TDOnlineMartPaymentStrategy implements PaymentStrategy {
    private tdOnlineMartClient?: TDCustomCheckoutSDK;
    private cardNumberInput?: TdOnlineMartElement;
    private cvvInput?: TdOnlineMartElement;
    private expiryInput?: TdOnlineMartElement;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private tdOnlineMartScriptLoader: TDOnlineMartScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        const { methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        this.tdOnlineMartClient = await this.loadTDOnlineMartJs();

        this.mountHostedFields(methodId);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!payment.methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paymentToken = await this.getTokenOrThrow();

        await this.paymentIntegrationService.submitOrder(order, options);

        await this.paymentIntegrationService.submitPayment({
            methodId: payment.methodId,
            paymentData: {
                nonce: paymentToken,
            },
        });
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.cardNumberInput?.unmount();
        this.cvvInput?.unmount();
        this.expiryInput?.unmount();

        return Promise.resolve();
    }

    private mountHostedFields(methodId: string): void {
        const tdOnlineMartClient = this.getTDOnlineMartClientOrThrow();

        this.cardNumberInput = tdOnlineMartClient.create(FieldType.CARD_NUMBER);
        this.cvvInput = tdOnlineMartClient.create(FieldType.CVV);
        this.expiryInput = tdOnlineMartClient.create(FieldType.EXPIRY);

        this.cardNumberInput.mount(`#${methodId}-ccNumber`);
        this.cvvInput.mount(`#${methodId}-ccCvv`);
        this.expiryInput.mount(`#${methodId}-ccExpiry`);
    }

    private async loadTDOnlineMartJs(): Promise<TDCustomCheckoutSDK> {
        if (this.tdOnlineMartClient) {
            return this.tdOnlineMartClient;
        }

        return this.tdOnlineMartScriptLoader.load();
    }

    private getTokenOrThrow(): Promise<string> {
        return new Promise((resolve) => {
            this.getTDOnlineMartClientOrThrow().createToken((result) => {
                const { error, token } = result;

                if (error || !token) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
                }

                resolve(token);
            });
        });
    }

    private getTDOnlineMartClientOrThrow(): TDCustomCheckoutSDK {
        if (!this.tdOnlineMartClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.tdOnlineMartClient;
    }
}
