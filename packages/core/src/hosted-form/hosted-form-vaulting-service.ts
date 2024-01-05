import { NotInitializedError, NotInitializedErrorType } from '../common/error/errors';

import HostedFormOptions from './hosted-form-options';
import HostedFormVaulting from './hosted-form-vaulting';
import HostedFormVaultingFactory from './hosted-form-vaulting-factory';
import {
    HostedFormVaultingData,
    HostedFormVaultingInstrumentFields,
} from './hosted-form-vaulting-type';

export default class HostedFormVaultingService {
    protected _hostedForm?: HostedFormVaulting;
    constructor(protected _host: string, protected _hostedFormFactory: HostedFormVaultingFactory) {}

    async submit(
        fields: HostedFormVaultingInstrumentFields,
        data: HostedFormVaultingData,
    ): Promise<void> {
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await form.validate().then(() => form.submit({ fields, data }));
    }

    initialize(options: HostedFormOptions): Promise<void> {
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
