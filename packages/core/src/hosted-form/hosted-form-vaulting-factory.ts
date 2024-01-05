import { pick } from 'lodash';

import { DetachmentObserver, MutationObserverFactory } from '../common/dom';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import HostedField from './hosted-field';
import HostedFieldType from './hosted-field-type';
import HostedFormOptions, {
    HostedCardFieldOptionsMap,
    HostedStoredCardFieldOptionsMap,
} from './hosted-form-options';
import HostedFormVaulting from './hosted-form-vaulting';

export default class HostedFormVaultingFactory {
    create(host: string, options: HostedFormOptions): HostedFormVaulting {
        const fieldTypes = Object.keys(options.fields) as HostedFieldType[];
        const fields = fieldTypes.reduce<HostedField[]>((result, type) => {
            const fields = options.fields as HostedStoredCardFieldOptionsMap &
                HostedCardFieldOptionsMap;
            const fieldOptions = fields[type];

            if (!fieldOptions) {
                return result;
            }

            return [
                ...result,
                new HostedField(
                    type,
                    fieldOptions.containerId,
                    fieldOptions.placeholder || '',
                    fieldOptions.accessibilityLabel || '',
                    options.styles || {},
                    new IframeEventPoster(host),
                    new IframeEventListener(host),
                    new DetachmentObserver(new MutationObserverFactory()),
                ),
            ];
        }, []);

        return new HostedFormVaulting(
            fields,
            new IframeEventListener(host),
            pick(options, 'onBlur', 'onEnter', 'onFocus', 'onCardTypeChange', 'onValidate'),
        );
    }
}
