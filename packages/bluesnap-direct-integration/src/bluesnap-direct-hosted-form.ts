import { kebabCase } from 'lodash';

import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    guard,
    HostedCardFieldOptionsMap,
    HostedFieldBlurEventData,
    HostedFieldEnterEventData,
    HostedFieldFocusEventData,
    HostedFieldOptionsMap,
    HostedFieldStylesMap,
    HostedFormOptions,
    HostedInputValidateErrorData,
    HostedStoredCardFieldOptionsMap,
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
import isValidationErrorDescription from './is-bluesnap-direct-input-validation-error-description';
import isHostedCardFieldOptionsMap from './is-hosted-card-field-options-map';
import isHostedStoredCardFieldOptionsMap from './is-hosted-stored-card-field-options-map';
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
    BlueSnapDirectThreeDSecureData as ThreeDSecureData,
} from './types';

export default class BlueSnapDirectHostedForm {
    private _blueSnapSdk?: BlueSnapDirectSdk;
    private _onValidate: HostedFormOptions['onValidate'];

    constructor(
        private _scriptLoader: BlueSnapDirectScriptLoader,
        private _nameOnCardInput: BluesnapDirectNameOnCardInput,
        private _hostedInputValidator: BlueSnapHostedInputValidator,
    ) {}

    async initialize(testMode = false, fields?: HostedFieldOptionsMap): Promise<void> {
        this._blueSnapSdk = await this._scriptLoader.load(testMode);

        if (!fields) {
            return;
        }

        if (isHostedCardFieldOptionsMap(fields)) {
            this._hostedInputValidator.initialize();

            return;
        }

        if (isHostedStoredCardFieldOptionsMap(fields) && !!fields.cardNumberVerification) {
            this._hostedInputValidator.initializeValidationFields();
        }
    }

    async attach(
        paymentFieldsToken: string,
        { form: { fields, ...callbacksAndStyles } }: CreditCardPaymentInitializeOptions,
        enable3DS = false,
    ): Promise<void> {
        const blueSnapSdk = this._getBlueSnapSdk();

        if (!isHostedCardFieldOptionsMap(fields) && !isHostedStoredCardFieldOptionsMap(fields)) {
            throw new InvalidArgumentError(
                'Field options must be of type HostedCardFieldOptionsMap',
            );
        }

        this._onValidate = callbacksAndStyles.onValidate;

        if (isHostedCardFieldOptionsMap(fields)) {
            this._setCustomBlueSnapAttributes(fields);
        }

        if (isHostedStoredCardFieldOptionsMap(fields)) {
            this._setCustomStoredCardsBlueSnapAttributes(fields);
        }

        return new Promise<void>((resolve) => {
            const options = this._getHostedPaymentFieldsOptions(
                paymentFieldsToken,
                fields,
                callbacksAndStyles,
                resolve,
                enable3DS,
            );

            blueSnapSdk.hostedPaymentFieldsCreate(options);

            if (isHostedCardFieldOptionsMap(fields)) {
                this._nameOnCardInput.attach(
                    options,
                    fields.cardName.accessibilityLabel,
                    fields.cardName.placeholder,
                );
            }
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

    submit(
        threeDSecureData?: ThreeDSecureData,
        shouldSendName = false,
    ): Promise<CallbackCardData & CardHolderName> {
        return new Promise((resolve, reject) =>
            this._getBlueSnapSdk().hostedPaymentFieldsSubmitData(
                (data: CallbackResults) =>
                    this._isBlueSnapDirectCallbackError(data)
                        ? reject(
                              new PaymentMethodFailedError(
                                  data.statusCode === ErrorCode.THREE_DS_AUTH_FAILED
                                      ? data.error[0].errorDescription
                                      : `Submission failed with status: ${
                                            data.statusCode
                                        } and errors: ${JSON.stringify(data.error)}`,
                              ),
                          )
                        : resolve({
                              ...data.cardData,
                              ...(shouldSendName
                                  ? { cardHolderName: this._nameOnCardInput.getValue() }
                                  : {}),
                          }),
                threeDSecureData,
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
        fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
        {
            onFocus,
            onBlur,
            onValidate,
            onCardTypeChange,
            onEnter,
            styles,
        }: Omit<HostedFormOptions, 'fields'>,
        resolve: () => void,
        enable3DS: boolean,
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
            ...(isHostedCardFieldOptionsMap(fields) && {
                ccnPlaceHolder: fields.cardNumber.placeholder || '',
                cvvPlaceHolder: fields.cardCode?.placeholder || '',
                expPlaceHolder: fields.cardExpiry.placeholder || 'MM / YY',
            }),
            ...(styles && { style: this._mapStyles(styles) }),
            '3DS': enable3DS,
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
            if (errorCode === ErrorCode.INVALID_OR_EMPTY) {
                if (tagId && isValidationErrorDescription(errorDescription)) {
                    return onValidate?.(
                        this._hostedInputValidator.validate({ tagId, errorDescription }),
                    );
                }
            }

            throw new PaymentMethodFailedError(
                `An unexpected error has occurred: ${JSON.stringify({
                    tagId,
                    errorCode,
                    errorDescription,
                    eventOrigin,
                })}`,
            );
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

    private _setCustomStoredCardsBlueSnapAttributes(fields: HostedStoredCardFieldOptionsMap): void {
        const { cardNumberVerification, cardCodeVerification } = fields;

        const cardNumberContainer =
            cardNumberVerification && document.getElementById(cardNumberVerification.containerId);
        const cardCodeContainer =
            cardCodeVerification && document.getElementById(cardCodeVerification.containerId);

        if (!cardNumberContainer && !cardCodeContainer) {
            return;
        }

        if (cardNumberContainer) {
            cardNumberContainer.dataset.bluesnap = HostedFieldTagId.CardNumber;
        }

        if (cardCodeContainer) {
            cardCodeContainer.dataset.bluesnap = HostedFieldTagId.CardCode;
        }
    }
}
