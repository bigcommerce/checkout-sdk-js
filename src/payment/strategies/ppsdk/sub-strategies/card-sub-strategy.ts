import { CheckoutStore } from '../../../../checkout';
import { InvalidArgumentError, NotInitializedError, NotInitializedErrorType } from '../../../../common/error/errors';
import { HostedForm, HostedFormFactory } from '../../../../hosted-form';
import { OrderActionCreator } from '../../../../order';
import { PaymentArgumentInvalidError } from '../../../errors';
import { PaymentInitializeOptions } from '../../../payment-request-options';
import { SubStrategy, SubStrategySettings } from '../ppsdk-sub-strategy';

export class CardSubStrategy implements SubStrategy {
    protected _hostedForm?: HostedForm;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _hostedFormFactory: HostedFormFactory
    ) {}

    async execute({ payment }: SubStrategySettings): Promise<void> {
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        await form.validate();

        await form.submit(payment);

        await this._store.dispatch(this._orderActionCreator.loadCurrentOrder());
    }

    async initialize(options?: PaymentInitializeOptions): Promise<void> {
        const formOptions = options && options.creditCard && options.creditCard.form;
        const { config } = this._store.getState();
        const { paymentSettings: { bigpayBaseUrl: host = '' } = {} } = config.getStoreConfig() || {};

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
