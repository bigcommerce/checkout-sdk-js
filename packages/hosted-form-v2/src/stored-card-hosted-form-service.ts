import { NotInitializedError, NotInitializedErrorType } from './common/errors';
import HostedForm from './hosted-form';
import HostedFormFactory from './hosted-form-factory';
import LegacyHostedFormOptions from './hosted-form-options';
import {
    StoredCardHostedFormData,
    StoredCardHostedFormInstrumentFields,
} from './stored-card-hosted-form-type';

export default class StoredCardHostedFormService {
    protected _hostedForm?: HostedForm;
    constructor(protected _host: string, protected _hostedFormFactory: HostedFormFactory) {}

    async submitStoredCard(
        fields: StoredCardHostedFormInstrumentFields,
        data: StoredCardHostedFormData,
    ): Promise<void> {
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await form.validate().then(() => form.submitStoredCard({ fields, data }));
    }

    initialize(options: LegacyHostedFormOptions): Promise<void> {
        const form = this._hostedFormFactory.create(this._host, options);

        return form.attach().then(() => {
            this._hostedForm = form;
        });
    }

    deinitialize() {
        if (this._hostedForm) {
            this._hostedForm.detach();
        }
    }
}
