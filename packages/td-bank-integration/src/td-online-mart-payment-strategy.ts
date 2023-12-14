import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import {
    InvalidArgumentError,
    isRequestError,
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

        const { methodId } = payment;

        if (!methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paymentToken = await this.getTokenOrThrow();

        await this.paymentIntegrationService.submitOrder(order, options);

        try {
            await this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData: {
                    nonce: paymentToken,
                },
            });
        } catch (error: unknown) {
            await this.processWithAdditionalAction(error);
        }
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

    private async processWithAdditionalAction(error: unknown): Promise<void> {
        /* eslint-disable
            @typescript-eslint/no-unsafe-assignment,
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-unsafe-argument
        */
        // TODO: eslint disable should be fixed by adding correct type for error.body and type guard
        if (
            !isRequestError(error) ||
            // TODO: add type guard for error.body
            // TODO: check which error code will be returned from BE
            // 'three_d_secure_required' or 'additional_action_required'
            !some(error.body.errors, { code: 'additional_action_required' })
        ) {
            throw error;
        }

        // Form data example is from https://dev.na.bambora.com/docs/guides/3D_secure_2_0/#3d-secure-2-0-api
        // TODO: select correct data which will be returned from BE
        const {
            data: { formUrl, threeDSSessionData, creq },
        } = error.body.additional_action_required;

        return new Promise<void>((resolve) => {
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
        /* eslint-enable
            @typescript-eslint/no-unsafe-assignment,
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-unsafe-argument
        */
    }
}
