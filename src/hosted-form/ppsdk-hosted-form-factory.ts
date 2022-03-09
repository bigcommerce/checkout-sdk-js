import { pick } from 'lodash';

import { ReadableCheckoutStore } from '../checkout';
import { DetachmentObserver, MutationObserverFactory } from '../common/dom';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { CardInstrument } from '../payment/instrument';

import HostedField from './hosted-field';
import HostedFieldType from './hosted-field-type';
import HostedFormOptions, { HostedCardFieldOptionsMap, HostedStoredCardFieldOptionsMap } from './hosted-form-options';
import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';
import PpsdkHostedForm from './ppsdk-hosted-form';

export default class PpsdkHostedFormFactory {
    constructor(
        private _store: ReadableCheckoutStore
    ) {}

    create(host: string, options: HostedFormOptions): PpsdkHostedForm {
        const fieldTypes = Object.keys(options.fields) as HostedFieldType[];
        const fields = fieldTypes.reduce<HostedField[]>((result, type) => {
            const fields = options.fields as HostedStoredCardFieldOptionsMap & HostedCardFieldOptionsMap;
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
                    'instrumentId' in fieldOptions ?
                        this._getCardInstrument(fieldOptions.instrumentId) :
                        undefined
                ),
            ];
        }, []);

        // Another order data transformer for PPDSK can be used
        return new PpsdkHostedForm(
            fields,
            new IframeEventListener(host),
            new HostedFormOrderDataTransformer(this._store),
            pick(options, 'onBlur', 'onEnter', 'onFocus', 'onCardTypeChange', 'onValidate')
        );
    }

    private _getCardInstrument(instrumentId: string): CardInstrument {
        const { instruments: { getCardInstrument } } = this._store.getState();
        const instrument = getCardInstrument(instrumentId);

        if (!instrument) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentInstrument);
        }

        return instrument;
    }
}
