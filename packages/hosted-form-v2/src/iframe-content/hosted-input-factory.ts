import { createRequestSender } from '@bigcommerce/request-sender';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { appendWww, parseUrl } from '../common/url';
import HostedFieldType from '../hosted-field-type';
import { ManualOrderPaymentRequestSender } from '../payment';

import CardExpiryFormatter from './card-expiry-formatter';
import CardNumberFormatter from './card-number-formatter';
import getHostedInputStorage from './get-hosted-input-storage';
import HostedAutocompleteFieldset from './hosted-autocomplete-fieldset';
import HostedCardExpiryInput from './hosted-card-expiry-input';
import HostedCardNumberInput from './hosted-card-number-input';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import HostedInputManualOrderPaymentHandler from './hosted-input-manual-order-payment-handler';
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
            this._createManualOrderPaymentHandler(),
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
            new HostedInputValidator(),
            this._createManualOrderPaymentHandler(),
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
            new HostedInputValidator(),
            this._createManualOrderPaymentHandler(),
        );
    }

    private _createManualOrderPaymentHandler(): HostedInputManualOrderPaymentHandler {
        return new HostedInputManualOrderPaymentHandler(
            new HostedInputAggregator(window.parent),
            new HostedInputValidator(),
            getHostedInputStorage(),
            new IframeEventPoster(this._parentOrigin, window.parent),
            new ManualOrderPaymentRequestSender(createRequestSender()),
        );
    }
}
