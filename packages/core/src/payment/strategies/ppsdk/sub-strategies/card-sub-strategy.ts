import { CheckoutStore } from '../../../../checkout';
import {
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../../common/error/errors';
import { HostedForm, HostedFormFactory } from '../../../../hosted-form';
import { OrderActionCreator } from '../../../../order';
import { PaymentArgumentInvalidError } from '../../../errors';
import PaymentAdditionalAction from '../../../payment-additional-action';
import { PaymentInitializeOptions } from '../../../payment-request-options';
import { SubStrategy, SubStrategySettings } from '../ppsdk-sub-strategy';
import { StepHandler } from '../step-handler';

export class CardSubStrategy implements SubStrategy {
    protected _hostedForm?: HostedForm;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _hostedFormFactory: HostedFormFactory,
        private _ppsdkStepHandler: StepHandler,
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

        const humanVerificationCallback = async (
            additionalAction: PaymentAdditionalAction,
        ): Promise<void> => this.execute({ additionalAction, ...settings });

        await this._ppsdkStepHandler.handle(response, {
            continue: {
                humanVerification: humanVerificationCallback,
            },
        });

        await this._store.dispatch(this._orderActionCreator.loadCurrentOrder());
    }

    async initialize(options?: PaymentInitializeOptions): Promise<void> {
        const formOptions = options && options.creditCard && options.creditCard.form;
        const { config } = this._store.getState();
        const { paymentSettings: { bigpayBaseUrl: host = '' } = {} } =
            config.getStoreConfig() || {};

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
