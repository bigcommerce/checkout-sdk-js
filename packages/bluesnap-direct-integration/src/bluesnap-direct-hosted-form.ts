import { kebabCase } from 'lodash';

import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    guard,
    HostedFieldBlurEventData,
    HostedFieldEnterEventData,
    HostedFieldFocusEventData,
    HostedFieldStylesMap,
    HostedFormOptions,
    HostedInputValidateResults,
    InvalidArgumentError,
    InvalidHostedFormValueError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { HOSTED_FIELD_TYPES } from './bluesnap-direct-constants';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import isHostedCardFieldOptionsMap from './is-hosted-card-field-options-map';
import {
    BlueSnapDirectSdk,
    BlueSnapDirectStyle,
    BlueSnapDirectCallbackCardData as CallbackCardData,
    BlueSnapDirectCallbackError as CallbackError,
    BlueSnapDirectCallbackResults as CallbackResults,
    BlueSnapDirectCardType as CardType,
    BlueSnapDirectCardTypeValues as CardTypeValues,
    BlueSnapDirectErrorCode as ErrorCode,
    BlueSnapDirectErrorDescription as ErrorDescription,
    BlueSnapDirectEventOrigin as EventOrigin,
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
    BlueSnapDirectHostedPaymentFieldsOptions as HostedPaymentFieldsOptions,
} from './types';

export default class BlueSnapDirectHostedForm {
    private _blueSnapSdk?: BlueSnapDirectSdk;
    private _onValidate: HostedFormOptions['onValidate'];

    constructor(
        private _scriptLoader: BlueSnapDirectScriptLoader,
        private _hostedInputValidator: BlueSnapHostedInputValidator,
    ) {}

    async initialize(testMode = false): Promise<void> {
        this._blueSnapSdk = await this._scriptLoader.load(testMode);
    }

    async attach(
        paymentFieldsToken: string,
        { form }: CreditCardPaymentInitializeOptions,
    ): Promise<void> {
        this._onValidate = form.onValidate;
        this._setCustomBlueSnapAttributes(form.fields);

        return new Promise<void>((resolve) =>
            this._getBlueSnapSdk().hostedPaymentFieldsCreate(
                this._getHostedPaymentFieldsOptions(paymentFieldsToken, form, resolve),
            ),
        );
    }

    onValidate(bcResults: HostedInputValidateResults): void {
        this._onValidate?.(this._hostedInputValidator.mergeErrors(bcResults.errors).validate());
    }

    validate(): this {
        const results = this._hostedInputValidator.validate();

        this._onValidate?.(results);

        if (!results.isValid) {
            throw new InvalidHostedFormValueError(results.errors);
        }

        return this;
    }

    submit(): Promise<CallbackCardData> {
        return new Promise((resolve, reject) =>
            this._getBlueSnapSdk().hostedPaymentFieldsSubmitData((data: CallbackResults) =>
                this._isBlueSnapDirectCallbackError(data)
                    ? reject(
                          new PaymentMethodFailedError(
                              `Submission failed with status: ${
                                  data.statusCode
                              } and errors: ${JSON.stringify(data.error)}`,
                          ),
                      )
                    : resolve(data.cardData),
            ),
        );
    }

    private _isBlueSnapDirectCallbackError(data: CallbackResults): data is CallbackError {
        return 'error' in data;
    }

    private _getHostedPaymentFieldsOptions(
        token: string,
        { onFocus, onBlur, onValidate, onCardTypeChange, onEnter, styles }: HostedFormOptions,
        resolve: () => void,
    ): HostedPaymentFieldsOptions {
        return {
            token,
            onFieldEventHandler: {
                setupComplete: () => resolve(),
                onFocus: this._usetUiEventCallback(onFocus),
                onBlur: this._usetUiEventCallback(onBlur),
                onError: this._handleError(onValidate),
                onType: (_tagId: HostedFieldTagId, cardType: CardTypeValues) =>
                    onCardTypeChange?.({ cardType: CardType[cardType] }),
                onEnter: this._usetUiEventCallback(onEnter),
                onValid: (tagId: HostedFieldTagId) =>
                    onValidate?.(this._hostedInputValidator.validate({ tagId })),
            },
            ccnPlaceHolder: '',
            cvvPlaceHolder: '',
            expPlaceHolder: 'MM / YY',
            ...(styles && { style: this._mapStyles(styles) }),
        };
    }

    private _mapStyles({
        default: input,
        error,
        focus,
    }: HostedFieldStylesMap): BlueSnapDirectStyle {
        return Object.entries({
            ...(input && { input }),
            ...(error && { '.invalid': error }),
            ...(focus && { ':focus': focus }),
        }).reduce((result, [selector, declaration]) => {
            return {
                ...result,
                [selector]: Object.entries(declaration).reduce(
                    (declarationBlock, [property, value]) => ({
                        ...declarationBlock,
                        [kebabCase(property)]: value,
                    }),
                    {},
                ),
            };
        }, {});
    }

    private _handleError(
        onValidate: HostedFormOptions['onValidate'],
    ): (
        tagId: HostedFieldTagId | undefined,
        errorCode: ErrorCode,
        errorDescription: ErrorDescription | undefined,
        eventOrigin: EventOrigin | undefined,
    ) => void {
        return (tagId, errorCode, errorDescription, eventOrigin) => {
            if (tagId === undefined || errorCode !== ErrorCode.INVALID_OR_EMPTY) {
                throw new PaymentMethodFailedError(
                    `An unexpected error has occurred: ${JSON.stringify({
                        tagId,
                        errorCode,
                        errorDescription,
                        eventOrigin,
                    })}`,
                );
            }

            onValidate?.(this._hostedInputValidator.validate({ tagId, errorDescription }));
        };
    }

    private _usetUiEventCallback(
        callback?: (
            data: HostedFieldBlurEventData | HostedFieldEnterEventData | HostedFieldFocusEventData,
        ) => void,
    ): (tagId: HostedFieldTagId) => void {
        return (tagId) => {
            if (callback) {
                callback({ fieldType: HOSTED_FIELD_TYPES[tagId] });
            }
        };
    }

    private _getBlueSnapSdk(): BlueSnapDirectSdk {
        return guard(
            this._blueSnapSdk,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _setCustomBlueSnapAttributes(fields: HostedFieldOptionsMap): void {
        if (!isHostedCardFieldOptionsMap(fields)) {
            throw new InvalidArgumentError(
                'Field options must be of type HostedCardFieldOptionsMap',
            );
        }

        const { cardNumber, cardExpiry, cardCode } = fields;

        const cardNumberContainer = document.getElementById(cardNumber.containerId);
        const cardExpiryContainer = document.getElementById(cardExpiry.containerId);
        const cardCodeContainer = cardCode && document.getElementById(cardCode.containerId);

        if (!cardNumberContainer || !cardExpiryContainer || !cardCodeContainer) {
            throw new InvalidArgumentError(
                'Unable to create hosted payment fields to invalid HTML container elements.',
            );
        }

        cardNumberContainer.dataset.bluesnap = HostedFieldTagId.CardNumber;
        cardExpiryContainer.dataset.bluesnap = HostedFieldTagId.CardExpiry;
        cardCodeContainer.dataset.bluesnap = HostedFieldTagId.CardCode;
    }
}
