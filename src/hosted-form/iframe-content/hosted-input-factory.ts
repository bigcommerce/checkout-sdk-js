import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { PaymentRequestSender, PaymentRequestTransformer } from '../../payment';
import { CardInstrument } from '../../payment/instrument';
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
        form: HTMLFormElement,
        type: HostedFieldType,
        styles: HostedInputStylesMap = {},
        fontUrls: string[] = [],
        placeholder: string = '',
        accessibilityLabel: string = mapToAccessibilityLabel(type),
        cardInstrument?: CardInstrument
    ): HostedInput {
        const autocomplete = mapToAutocompleteType(type);

        if (type === HostedFieldType.CardNumber) {
            return this._createNumberInput(form, styles, fontUrls, placeholder, accessibilityLabel, autocomplete);
        }

        if (type === HostedFieldType.CardNumberVerification) {
            return this._createNumberInput(form, styles, fontUrls, placeholder, accessibilityLabel, autocomplete, cardInstrument);
        }

        if (type === HostedFieldType.CardExpiry) {
            return this._createExpiryInput(form, styles, fontUrls, placeholder, accessibilityLabel, autocomplete);
        }

        if (type === HostedFieldType.CardCodeVerification) {
            return this._createInput(type, form, styles, fontUrls, placeholder, accessibilityLabel, autocomplete, cardInstrument);
        }

        return this._createInput(type, form, styles, fontUrls, placeholder, accessibilityLabel, autocomplete);
    }

    private _createExpiryInput(
        form: HTMLFormElement,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        placeholder: string,
        accessibilityLabel: string = '',
        autocomplete: string = ''
    ): HostedCardExpiryInput {
        return new HostedCardExpiryInput(
            form,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            fontUrls,
            new IframeEventListener(this._parentOrigin),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(),
            this._createPaymentHandler(),
            new CardExpiryFormatter()
        );
    }

    private _createNumberInput(
        form: HTMLFormElement,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        placeholder: string,
        accessibilityLabel: string = '',
        autocomplete: string = '',
        cardInstrument?: CardInstrument
    ): HostedCardNumberInput {
        return new HostedCardNumberInput(
            form,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            fontUrls,
            new IframeEventListener(this._parentOrigin),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(cardInstrument),
            this._createPaymentHandler(cardInstrument),
            new HostedAutocompleteFieldset(
                form,
                [HostedFieldType.CardCode, HostedFieldType.CardExpiry, HostedFieldType.CardName],
                new HostedInputAggregator(window.parent)
            ),
            new CardNumberFormatter()
        );
    }

    private _createInput(
        type: HostedFieldType,
        form: HTMLFormElement,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        placeholder: string,
        accessibilityLabel: string = '',
        autocomplete: string = '',
        cardInstrument?: CardInstrument
    ): HostedInput {
        return new HostedInput(
            type,
            form,
            placeholder,
            accessibilityLabel,
            autocomplete,
            styles,
            fontUrls,
            new IframeEventListener(this._parentOrigin),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(cardInstrument),
            this._createPaymentHandler(cardInstrument)
        );
    }

    private _createPaymentHandler(
        cardInstrument?: CardInstrument
    ): HostedInputPaymentHandler {
        return new HostedInputPaymentHandler(
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(cardInstrument),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new PaymentRequestSender(createBigpayClient()),
            new PaymentRequestTransformer()
        );
    }
}
