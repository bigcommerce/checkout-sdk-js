import { pick } from 'lodash';

import { DetachmentObserver, MutationObserverFactory } from './common/dom';
import { IframeEventListener, IframeEventPoster } from './common/iframe';
import HostedField from './hosted-field';
import HostedFieldType from './hosted-field-type';
import HostedForm from './hosted-form';
import HostedFormOptions from './hosted-form-options';

export default class HostedFormFactory {
    /**
     * @param host - (Payments origin) Used for postMessage target/source validation, because the
     * hosted-fields route redirects there, making it the iframe's actual document origin.
     * @param storefrontHost - (Channel's storefront origin) Serving the hosted-fields route,
     * used only for the iframe src. Only needed by headless storefronts, where it differs from the page's own origin.
     */
    create(host: string, options: HostedFormOptions, storefrontHost = ''): HostedForm {
        const fieldTypes = Object.keys(options.fields) as HostedFieldType[];
        const fields = fieldTypes.reduce<HostedField[]>((result, type) => {
            const fields = options.fields;
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
                    options.orderId,
                    storefrontHost,
                ),
            ];
        }, []);

        return new HostedForm(
            fields,
            new IframeEventListener(host),
            pick(options, 'onBlur', 'onEnter', 'onFocus', 'onCardTypeChange', 'onValidate'),
        );
    }
}
