import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { HostedFieldEventMap } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import CardExpiryFormatter from './card-expiry-formatter';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent } from './hosted-input-events';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';

export default class HostedCardExpiryInput extends HostedInput {
    /**
     * @internal
     */
    constructor(
        containerId: string,
        placeholder: string,
        accessibilityLabel: string,
        autocomplete: string,
        styles: HostedInputStylesMap,
        eventListener: IframeEventListener<HostedFieldEventMap>,
        eventPoster: IframeEventPoster<HostedInputEvent>,
        inputAggregator: HostedInputAggregator,
        inputValidator: HostedInputValidator,
        private _formatter: CardExpiryFormatter
    ) {
        super(
            HostedFieldType.CardExpiry,
            containerId,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            eventListener,
            eventPoster,
            inputAggregator,
            inputValidator
        );
    }

    protected _formatValue(value: string): void {
        this._input.value = this._formatter.format(value);
    }
}
