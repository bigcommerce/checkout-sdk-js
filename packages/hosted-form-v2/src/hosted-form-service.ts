import HostedForm from './hosted-form';
import HostedFormFactory from './hosted-form-factory';
import HostedFormOptions from './hosted-form-options';

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
}
