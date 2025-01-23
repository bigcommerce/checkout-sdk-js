import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { HostedFieldEventMap } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import CardExpiryFormatter from './card-expiry-formatter';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent } from './hosted-input-events';
import HostedInputManualOrderPaymentHandler from './hosted-input-manual-order-payment-handler';
import HostedInputStoredCardHandler from './hosted-input-stored-card-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';

export default class HostedCardExpiryInput extends HostedInput {
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
        manualOrderPaymentHandler: HostedInputManualOrderPaymentHandler,
        storedCardHandler: HostedInputStoredCardHandler,
        private _formatter: CardExpiryFormatter,
    ) {
        super(
            HostedFieldType.CardExpiry,
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
            manualOrderPaymentHandler,
            storedCardHandler,
        );
    }

    protected _formatValue(value: string): void {
        this._input.value = this._formatter.format(value);
    }
}
