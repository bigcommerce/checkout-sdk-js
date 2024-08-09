import { pick } from 'lodash';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { DetachmentObserver, MutationObserverFactory } from './common/dom';
import { IframeEventListener, IframeEventPoster } from './common/iframe';
import HostedField from './hosted-field';
import HostedFieldType from './hosted-field-type';
import HostedForm from './hosted-form';
import HostedFormOptions from './hosted-form-options';
import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

export default class HostedFormFactory {
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    create(host: string, options: HostedFormOptions): HostedForm {
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
                    options.orderId,
                    fieldOptions.placeholder || '',
                    fieldOptions.accessibilityLabel || '',
                    options.styles || {},
                    new IframeEventPoster(host),
                    new IframeEventListener(host),
                    new DetachmentObserver(new MutationObserverFactory()),
                ),
            ];
        }, []);

        return new HostedForm(
            fields,
            new IframeEventListener(host),
            new HostedFormOrderDataTransformer(this.paymentIntegrationService),
            pick(options, 'onBlur', 'onEnter', 'onFocus', 'onCardTypeChange', 'onValidate'),
            this.paymentIntegrationService,
        );
    }
}
