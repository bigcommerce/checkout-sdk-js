import { kebabCase } from 'lodash';

import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    guard,
    HostedCardFieldOptionsMap,
    HostedFieldBlurEventData,
    HostedFieldEnterEventData,
    HostedFieldFocusEventData,
    HostedFieldStylesMap,
    HostedFormOptions,
    HostedInputValidateErrorData,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapHostedFieldType } from './bluesnap-direct-constants';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import BluesnapDirectNameOnCardInput from './bluesnap-direct-name-on-card-input';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import isHostedCardFieldOptionsMap from './is-hosted-card-field-options-map';
import {
    BlueSnapDirectSdk,
    BlueSnapDirectStyle,
    BlueSnapDirectCallbackCardData as CallbackCardData,
    BlueSnapDirectCallbackError as CallbackError,
    BlueSnapDirectCallbackResults as CallbackResults,
    WithBlueSnapDirectCardHolderName as CardHolderName,
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
        private _nameOnCardInput: BluesnapDirectNameOnCardInput,
        private _hostedInputValidator: BlueSnapHostedInputValidator,
    ) {}

    async initialize(testMode = false): Promise<void> {
        this._blueSnapSdk = await this._scriptLoader.load(testMode);
        this._hostedInputValidator.initialize();
    }

    async attach(
        paymentFieldsToken: string,
        { form: { fields, ...callbacksAndStyles } }: CreditCardPaymentInitializeOptions,
    ): Promise<void> {
        const blueSnapSdk = this._getBlueSnapSdk();

        if (!isHostedCardFieldOptionsMap(fields)) {
            throw new InvalidArgumentError(
                'Field options must be of type HostedCardFieldOptionsMap',
            );
        }

        this._onValidate = callbacksAndStyles.onValidate;
        this._setCustomBlueSnapAttributes(fields);

        return new Promise<void>((resolve) => {
            const options = this._getHostedPaymentFieldsOptions(
                paymentFieldsToken,
                fields,
                callbacksAndStyles,
                resolve,
            );

            blueSnapSdk.hostedPaymentFieldsCreate(options);
            this._nameOnCardInput.attach(
                options,
                fields.cardName.accessibilityLabel,
                fields.cardName.placeholder,
            );
        });
    }

    validate(): this {
        const results = this._hostedInputValidator.validate();

        this._onValidate?.(results);

        if (!results.isValid) {
            const details = Object.entries(results.errors).reduce<PaymentInvalidFormErrorDetails>(
                (result, [key, value]: [string, HostedInputValidateErrorData[]]) => ({
                    ...result,
                    [key]: value.map(({ message, type }) => ({ message, type })),
                }),
                {},
            );

            throw new PaymentInvalidFormError(details);
        }

        return this;
    }

    submit(): Promise<CallbackCardData & CardHolderName> {
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
                    : resolve({
                          ...data.cardData,
                          cardHolderName: this._nameOnCardInput.getValue(),
                      }),
            ),
        );
    }

    detach(): void {
        this._nameOnCardInput.detach();
    }

    private _isBlueSnapDirectCallbackError(data: CallbackResults): data is CallbackError {
        return 'error' in data;
    }

    private _getHostedPaymentFieldsOptions(
        token: string,
        fields: HostedCardFieldOptionsMap,
        {
            onFocus,
            onBlur,
            onValidate,
            onCardTypeChange,
            onEnter,
            styles,
        }: Omit<HostedFormOptions, 'fields'>,
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
            ccnPlaceHolder: fields.cardNumber.placeholder || '',
            cvvPlaceHolder: fields.cardCode?.placeholder || '',
            expPlaceHolder: fields.cardExpiry.placeholder || 'MM / YY',
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
                callback({ fieldType: BlueSnapHostedFieldType[tagId] });
            }
        };
    }

    private _getBlueSnapSdk(): BlueSnapDirectSdk {
        return guard(
            this._blueSnapSdk,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _setCustomBlueSnapAttributes(fields: HostedCardFieldOptionsMap): void {
        const { cardNumber, cardExpiry, cardCode, cardName } = fields;

        const cardNumberContainer = document.getElementById(cardNumber.containerId);
        const cardExpiryContainer = document.getElementById(cardExpiry.containerId);
        const cardCodeContainer = cardCode && document.getElementById(cardCode.containerId);
        const cardNameContainer = document.getElementById(cardName.containerId);

        if (
            !cardNumberContainer ||
            !cardExpiryContainer ||
            !cardCodeContainer ||
            !cardNameContainer
        ) {
            throw new InvalidArgumentError(
                'Unable to create hosted payment fields to invalid HTML container elements.',
            );
        }

        cardNumberContainer.dataset.bluesnap = HostedFieldTagId.CardNumber;
        cardExpiryContainer.dataset.bluesnap = HostedFieldTagId.CardExpiry;
        cardCodeContainer.dataset.bluesnap = HostedFieldTagId.CardCode;
        cardNameContainer.dataset.bluesnap = HostedFieldTagId.CardName;
    }
}
