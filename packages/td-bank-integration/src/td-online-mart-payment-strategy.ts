import { FormPoster } from '@bigcommerce/form-poster';

import {
    getBrowserInfo,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isCreateTokenError from './is-create-token-error';
import { isTdOnlineMartAdditionalAction } from './isTdOnlineMartAdditionalAction';
import {
    FieldType,
    TDCustomCheckoutSDK,
    TDOnlineMartInput,
    TdOnlineMartThreeDSErrorBody,
} from './td-online-mart';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';

export default class TDOnlineMartPaymentStrategy implements PaymentStrategy {
    private tdOnlineMartClient?: TDCustomCheckoutSDK;
    private tdInputs: TDOnlineMartInput[] = [
        {
            id: 'ccNumber',
            fieldType: FieldType.CARD_NUMBER,
        },
        {
            id: 'ccCvv',
            fieldType: FieldType.CVV,
        },
        {
            id: 'ccExpiry',
            fieldType: FieldType.EXPIRY,
        },
    ];

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private tdOnlineMartScriptLoader: TDOnlineMartScriptLoader,
        private formPoster: FormPoster,
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

        const paymentPayload = await this.getPaymentPayloadOrThrow(payment);

        await this.paymentIntegrationService.submitOrder(order, options);

        try {
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error: unknown) {
            await this.processWithAdditionalAction(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.tdOnlineMartClient = undefined;

        this.tdInputs.forEach(({ inputElement }: TDOnlineMartInput) => {
            inputElement?.unmount();
        });

        return Promise.resolve();
    }

    private async getPaymentPayloadOrThrow(payment: OrderPaymentRequestBody) {
        const { methodId, paymentData } = payment;
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};
        const commonPaymentData = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            browser_info: getBrowserInfo(),
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        };

        if (
            isHostedInstrumentLike(paymentData) &&
            isVaultedInstrument(paymentData) &&
            paymentData.instrumentId
        ) {
            const cart = this.paymentIntegrationService.getState().getCartOrThrow();
            const digitalItemsInCart = !!cart.lineItems.digitalItems.length;

            const shouldAddVerificationToken =
                !this.isTrustedVaultingInstrument(paymentData.instrumentId) || digitalItemsInCart;

            return {
                methodId,
                paymentData: {
                    ...commonPaymentData,
                    instrumentId: paymentData.instrumentId,
                    ...(shouldAddVerificationToken ? { nonce: paymentData.instrumentId } : {}),
                },
            };
        }

        let nonce: string;

        try {
            nonce = await this.getTokenOrThrow();
        } catch (error) {
            this.throwTokenizationError(error);
        }

        return {
            methodId,
            paymentData: {
                ...commonPaymentData,
                nonce,
            },
        };
    }

    private mountHostedFields(methodId: string): void {
        const options = this.getHostedFieldsOptions();
        const tdOnlineMartClient = this.getTDOnlineMartClientOrThrow();

        this.tdInputs.forEach((input: TDOnlineMartInput) => {
            const inputId = `${methodId}-${input.id}`;

            if (!document.getElementById(inputId)) {
                return;
            }

            input.inputElement = tdOnlineMartClient.create(input.fieldType, options);
            input.inputElement.mount(`#${inputId}`);
        });
    }

    private async loadTDOnlineMartJs(): Promise<TDCustomCheckoutSDK> {
        if (this.tdOnlineMartClient) {
            return this.tdOnlineMartClient;
        }

        return this.tdOnlineMartScriptLoader.load();
    }

    private getTokenOrThrow(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.getTDOnlineMartClientOrThrow().createToken((result) => {
                const { error, token } = result;

                if (error || !token) {
                    return reject(error);
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

    private async processWithAdditionalAction(error: unknown): Promise<void> {
        if (!isTdOnlineMartAdditionalAction(error)) {
            throw error;
        }

        const { three_ds_result: threeDSResult }: TdOnlineMartThreeDSErrorBody = error.body;
        const {
            acs_url: formUrl,
            payer_auth_request: threeDSSessionData,
            merchant_data: creq,
        } = threeDSResult || {};

        if (!formUrl || !threeDSSessionData || !creq) {
            throw new PaymentArgumentInvalidError(['formUrl', 'threeDSSessionData', 'creq']);
        }

        return new Promise((resolve) => {
            this.formPoster.postForm(
                formUrl,
                {
                    threeDSSessionData,
                    creq,
                },
                resolve,
                '_top',
            );
        });
    }

    private throwTokenizationError(error: unknown): never {
        if (!isCreateTokenError(error)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        throw new Error(error.message);
    }

    private getHostedFieldsOptions() {
        const style = {
            error: {
                color: '#d14343',
            },
        };

        const classes = {
            error: 'form-input--error',
        };

        return {
            style,
            classes,
        };
    }

    private isTrustedVaultingInstrument(instrumentId: string): boolean {
        const instruments = this.paymentIntegrationService.getState().getInstruments();

        const { trustedShippingAddress } =
            instruments?.find(({ bigpayToken }) => bigpayToken === instrumentId) || {};

        return !!trustedShippingAddress;
    }
}
