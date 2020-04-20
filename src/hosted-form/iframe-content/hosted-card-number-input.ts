import { number } from 'card-validator';
import { get } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { HostedFieldEventMap } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import CardNumberFormatter from './card-number-formatter';
import HostedAutocompleteFieldset from './hosted-autocomplete-fieldset';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';

export default class HostedCardNumberInput extends HostedInput {
    /**
     * @internal
     */
    constructor(
        form: HTMLFormElement,
        placeholder: string,
        accessibilityLabel: string,
        autocomplete: string,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        eventListener: IframeEventListener<HostedFieldEventMap>,
        eventPoster: IframeEventPoster<HostedInputEvent>,
        inputAggregator: HostedInputAggregator,
        inputValidator: HostedInputValidator,
        paymentHandler: HostedInputPaymentHandler,
        private _autocompleteFieldset: HostedAutocompleteFieldset,
        private _formatter: CardNumberFormatter
    ) {
        super(
            HostedFieldType.CardNumber,
            form,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            fontUrls,
            eventListener,
            eventPoster,
            inputAggregator,
            inputValidator,
            paymentHandler
        );
    }

    attach(): void {
        super.attach();

        this._autocompleteFieldset.attach();
    }

    protected _notifyChange(value: string): void {
        const cardInfo = number(value).card;
        const prevCardInfo = this._previousValue && number(this._previousValue).card;

        if (get(prevCardInfo, 'type') !== get(cardInfo, 'type')) {
            this._eventPoster.post({
                type: HostedInputEventType.CardTypeChanged,
                payload: {
                    cardType: cardInfo ? cardInfo.type : undefined,
                },
            });
        }

        const bin = value.length >= 6 && number(value).isPotentiallyValid ? value.substr(0, 6) : '';
        const prevBin = this._previousValue && this._previousValue.length >= 6 ? this._previousValue.substr(0, 6) : '';

        if (bin !== prevBin) {
            this._eventPoster.post({
                type: HostedInputEventType.BinChanged,
                payload: { bin },
            });
        }
    }

    protected _formatValue(value: string): void {
        const selectionEnd = this._input.selectionEnd;
        const formattedValue = this._formatter.format(value);

        if (selectionEnd === value.length && value.length < formattedValue.length) {
            this._input.setSelectionRange(formattedValue.length, formattedValue.length);
        } else {
            this._input.setSelectionRange(selectionEnd || 0, selectionEnd || 0);
        }

        this._input.value = formattedValue;
    }
}
