import { pick } from 'lodash';

import { ReadableCheckoutStore } from '../checkout';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import HostedField from './hosted-field';
import HostedForm from './hosted-form';
import HostedFormOptions from './hosted-form-options';
import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

export default class HostedFormFactory {
    constructor(
        private _store: ReadableCheckoutStore
    ) {}

    create(host: string, formId: string, options: HostedFormOptions): HostedForm {
        const fieldTypes = Object.keys(options.fields) as Array<keyof HostedFormOptions['fields']>;
        const fields = fieldTypes.reduce<HostedField[]>((result, type) => {
            const fieldOption = options.fields[type];

            if (!fieldOption) {
                return result;
            }

            return [
                ...result,
                new HostedField(
                    host,
                    formId,
                    type,
                    fieldOption.containerId,
                    fieldOption.placeholder || '',
                    fieldOption.accessibilityLabel || '',
                    options.styles || {},
                    new IframeEventPoster(host),
                    new IframeEventListener(host)
                ),
            ];
        }, []);

        return new HostedForm(
            fields,
            new IframeEventListener(host),
            new HostedFormOrderDataTransformer(this._store),
            pick(options, 'onBlur', 'onFocus', 'onCardTypeChange', 'onValidateError')
        );
    }
}
