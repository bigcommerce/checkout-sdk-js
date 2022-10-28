
import {
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentAdditionalAction,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from "@bigcommerce/checkout-sdk/payment-integration-api";

import { HostedForm, HostedFormFactory } from "packages/core/src/hosted-form";

import { PpsdkPaymentInitializeOptions } from "../ppsdk-payment-initialize-options";
import { SubStrategy, SubStrategySettings } from '../ppsdk-sub-strategy';
import { StepHandler } from '../step-handler';

export class CardSubStrategy implements SubStrategy {
    protected _hostedForm?: HostedForm;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _hostedFormFactory: HostedFormFactory,
        private _ppsdkStepHandler: StepHandler
    ) {}

    async execute(settings: SubStrategySettings): Promise<void> {
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { additionalAction, payment } = settings;

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        await form.validate();

        const { payload } = await form.submit(payment, additionalAction);

        const { response } = payload;

        const humanVerificationCallback = async (additionalAction: PaymentAdditionalAction): Promise<void> => await this.execute({ additionalAction, ...settings });

        await this._ppsdkStepHandler.handle(
            response,
            {
                continue: {
                    humanVerification: humanVerificationCallback,
                },
            }
        );

        // await this._store.dispatch(this._orderActionCreator.loadCurrentOrder());
        await this._paymentIntegrationService.loadCurrentOrder();
    }

    async initialize(options?: PpsdkPaymentInitializeOptions): Promise<void> {
        const formOptions = options && options.creditCard && options.creditCard.form;
        // const { config } = this._store.getState();
        const config = this._paymentIntegrationService.getState().getStoreConfig();
        const { paymentSettings: { bigpayBaseUrl: host = '' } = {} } = config || {};

        if (!formOptions) {
            throw new InvalidArgumentError();
        }

        const form = formOptions && this._hostedFormFactory.create(host, formOptions);

        await form.attach();

        this._hostedForm = form;
    }

    deinitialize(): void {
        if (this._hostedForm) {
            this._hostedForm.detach();
        }
    }
}
