import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { PaymentRequestSender, PaymentRequestTransformer } from '../../payment';
import HostedFieldType from '../hosted-field-type';

import CardExpiryFormatter from './card-expiry-formatter';
import CardNumberFormatter from './card-number-formatter';
import HostedAutocompleteFieldset from './hosted-autocomplete-fieldset';
import HostedCardExpiryInput from './hosted-card-expiry-input';
import HostedCardNumberInput from './hosted-card-number-input';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';
import mapToAccessibilityLabel from './map-to-accessibility-label';
import mapToAutocompleteType from './map-to-autocomplete-type';

export default class HostedInputFactory {
    constructor(
        private _parentOrigin: string
    ) {}

    create(
        containerId: string,
        type: HostedFieldType,
        styles: HostedInputStylesMap = {},
        placeholder: string = '',
        accessibilityLabel: string = mapToAccessibilityLabel(type)
    ): HostedInput {
        const autocomplete = mapToAutocompleteType(type);

        if (type === HostedFieldType.CardNumber) {
            return this._createNumberInput(containerId, styles, placeholder, accessibilityLabel, autocomplete);
        }

        if (type === HostedFieldType.CardExpiry) {
            return this._createExpiryInput(containerId, styles, placeholder, accessibilityLabel, autocomplete);
        }

        return this._createInput(type, containerId, styles, placeholder, accessibilityLabel, autocomplete);
    }

    private _createExpiryInput(
        containerId:
        string,
        styles: HostedInputStylesMap,
        placeholder: string,
        accessibilityLabel: string = '',
        autocomplete: string = ''
    ): HostedCardExpiryInput {
        return new HostedCardExpiryInput(
            containerId,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            new IframeEventListener(this._parentOrigin),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(),
            new CardExpiryFormatter()
        );
    }

    private _createNumberInput(
        containerId: string,
        styles: HostedInputStylesMap,
        placeholder: string,
        accessibilityLabel: string = '',
        autocomplete: string = ''
    ): HostedCardNumberInput {
        return new HostedCardNumberInput(
            containerId,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            new IframeEventListener(this._parentOrigin),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(),
            new HostedAutocompleteFieldset(
                containerId,
                [HostedFieldType.CardCode, HostedFieldType.CardExpiry, HostedFieldType.CardName],
                new HostedInputAggregator(window.parent)
            ),
            new CardNumberFormatter(),
            new HostedInputPaymentHandler(
                new HostedInputAggregator(window.parent),
                new HostedInputValidator(),
                new IframeEventPoster(this._parentOrigin, window.parent),
                new PaymentRequestSender(createBigpayClient()),
                new PaymentRequestTransformer()
            )
        );
    }

    private _createInput(
        type: HostedFieldType,
        containerId: string,
        styles: HostedInputStylesMap,
        placeholder: string,
        accessibilityLabel: string = '',
        autocomplete: string = ''
    ): HostedInput {
        return new HostedInput(
            type,
            containerId,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            new IframeEventListener(this._parentOrigin),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new HostedInputAggregator(window.parent),
            new HostedInputValidator()
        );
    }
}
