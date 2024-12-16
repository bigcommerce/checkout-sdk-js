import { NotInitializedError, NotInitializedErrorType } from './common/errors';
import HostedForm from './hosted-form';
import HostedFormFactory from './hosted-form-factory';
import HostedFormManualOrderData from './hosted-form-manual-order-data';
import HostedFormOptions from './hosted-form-options';
import { HostedInputSubmitManualOrderSuccessEvent } from './iframe-content';

export default class HostedFormService {
    protected _hostedForm?: HostedForm;
    constructor(protected _host: string, protected _hostedFormFactory: HostedFormFactory) {}

    initialize(options: HostedFormOptions): Promise<void> {
        const form = this._hostedFormFactory.create(this._host, options);

        return form.attach().then(() => {
            this._hostedForm = form;
        });
    }

    deinitialize() {
        if (this._hostedForm) {
            this._hostedForm.detach();
            this._hostedForm = undefined;
        }
    }

    async submitManualOrderPayment(
        data: HostedFormManualOrderData,
    ): Promise<HostedInputSubmitManualOrderSuccessEvent | void> {
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await form.validate();

        return form.submitManualOrderPayment({ data });
    }
}
