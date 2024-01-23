import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { appendWww, parseUrl } from '../../common/url';
import {
    PaymentRequestSender,
    PaymentRequestTransformer,
    StorefrontStoredCardRequestSender,
} from '../../payment';
import { CardInstrument } from '../../payment/instrument';
import HostedFieldType from '../hosted-field-type';

import CardExpiryFormatter from './card-expiry-formatter';
import CardNumberFormatter from './card-number-formatter';
import getHostedInputStorage from './get-hosted-input-storage';
import HostedAutocompleteFieldset from './hosted-autocomplete-fieldset';
import HostedCardExpiryInput from './hosted-card-expiry-input';
import HostedCardNumberInput from './hosted-card-number-input';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import HostedInputStoredCardHandler from './hosted-input-stored-card-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';
import mapToAccessibilityLabel from './map-to-accessibility-label';
import mapToAutocompleteType from './map-to-autocomplete-type';

export default class HostedInputFactory {
    constructor(private _parentOrigin: string) {}

    create(
        form: HTMLFormElement,
        type: HostedFieldType,
        styles: HostedInputStylesMap = {},
        fontUrls: string[] = [],
        placeholder = '',
        accessibilityLabel: string = mapToAccessibilityLabel(type),
        cardInstrument?: CardInstrument,
    ): HostedInput {
        const autocomplete = mapToAutocompleteType(type);

        if (type === HostedFieldType.CardNumber) {
            return this._createNumberInput(
                type,
                form,
                styles,
                fontUrls,
                placeholder,
                accessibilityLabel,
                autocomplete,
            );
        }

        if (type === HostedFieldType.CardNumberVerification) {
            return this._createNumberInput(
                type,
                form,
                styles,
                fontUrls,
                placeholder,
                accessibilityLabel,
                autocomplete,
                cardInstrument,
            );
        }

        if (type === HostedFieldType.CardExpiry) {
            return this._createExpiryInput(
                form,
                styles,
                fontUrls,
                placeholder,
                accessibilityLabel,
                autocomplete,
            );
        }

        if (type === HostedFieldType.CardCodeVerification) {
            return this._createInput(
                type,
                form,
                styles,
                fontUrls,
                placeholder,
                accessibilityLabel,
                autocomplete,
                cardInstrument,
            );
        }

        return this._createInput(
            type,
            form,
            styles,
            fontUrls,
            placeholder,
            accessibilityLabel,
            autocomplete,
        );
    }

    normalizeParentOrigin(origin: string): void {
        if (this._parentOrigin === origin) {
            return;
        }

        if (
            this._parentOrigin !== appendWww(parseUrl(origin)).origin &&
            origin !== appendWww(parseUrl(this._parentOrigin)).origin
        ) {
            return;
        }

        this._parentOrigin = origin;
    }

    getParentOrigin(): string {
        return this._parentOrigin;
    }

    private _createExpiryInput(
        form: HTMLFormElement,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        placeholder: string,
        accessibilityLabel = '',
        autocomplete = '',
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
            this._createStoredCardHandler(),
            new CardExpiryFormatter(),
        );
    }

    private _createNumberInput(
        type: HostedFieldType,
        form: HTMLFormElement,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        placeholder: string,
        accessibilityLabel = '',
        autocomplete = '',
        cardInstrument?: CardInstrument,
    ): HostedCardNumberInput {
        return new HostedCardNumberInput(
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
            this._createPaymentHandler(cardInstrument),
            this._createStoredCardHandler(cardInstrument),
            new HostedAutocompleteFieldset(
                form,
                [HostedFieldType.CardCode, HostedFieldType.CardExpiry, HostedFieldType.CardName],
                new HostedInputAggregator(window.parent),
            ),
            new CardNumberFormatter(),
        );
    }

    private _createInput(
        type: HostedFieldType,
        form: HTMLFormElement,
        styles: HostedInputStylesMap,
        fontUrls: string[],
        placeholder: string,
        accessibilityLabel = '',
        autocomplete = '',
        cardInstrument?: CardInstrument,
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
            this._createPaymentHandler(cardInstrument),
            this._createStoredCardHandler(cardInstrument),
        );
    }

    private _createPaymentHandler(cardInstrument?: CardInstrument): HostedInputPaymentHandler {
        return new HostedInputPaymentHandler(
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(cardInstrument),
            getHostedInputStorage(),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new PaymentRequestSender(createBigpayClient()),
            new PaymentRequestTransformer(),
        );
    }

    private _createStoredCardHandler(
        cardInstrument?: CardInstrument,
    ): HostedInputStoredCardHandler {
        return new HostedInputStoredCardHandler(
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(cardInstrument),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new StorefrontStoredCardRequestSender(createRequestSender()),
        );
    }
}
