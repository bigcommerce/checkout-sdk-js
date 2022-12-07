import { createScriptLoader } from '@bigcommerce/script-loader';
import { pick } from 'lodash';

import {
    HostedCardFieldOptionsMap,
    HostedFieldType,
    HostedFormOptions,
    HostedStoredCardFieldOptionsMap,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ReadableCheckoutStore } from '../checkout';
import { DetachmentObserver, MutationObserverFactory } from '../common/dom';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { CardInstrument } from '../payment/instrument';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../spam-protection';

import HostedField from './hosted-field';
import HostedForm from './hosted-form';
import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

export default class HostedFormFactory {
    constructor(private _store: ReadableCheckoutStore) {}

    create(host: string, options: HostedFormOptions): HostedForm {
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
                    'instrumentId' in fieldOptions
                        ? this._getCardInstrument(fieldOptions.instrumentId)
                        : undefined,
                ),
            ];
        }, []);

        return new HostedForm(
            fields,
            new IframeEventListener(host),
            new HostedFormOrderDataTransformer(this._store),
            pick(options, 'onBlur', 'onEnter', 'onFocus', 'onCardTypeChange', 'onValidate'),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );
    }

    private _getCardInstrument(instrumentId: string): CardInstrument {
        const {
            instruments: { getCardInstrument },
        } = this._store.getState();
        const instrument = getCardInstrument(instrumentId);

        if (!instrument) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentInstrument);
        }

        return instrument;
    }
}
