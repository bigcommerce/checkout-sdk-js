import {
    guard,
    NotInitializedError,
    NotInitializedErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isArrayOfAllowedProps from './is-array-of-allowed-props';
import {
    BluesnapDirectNocInputAllowedStyle as AllowedStyle,
    BlueSnapDirectStyle,
    BlueSnapDirectErrorCode as ErrorCode,
    BlueSnapDirectErrorDescription as ErrorDescription,
    BlueSnapDirectEventOrigin as EventOrigin,
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
    BlueSnapDirectHostedPaymentFieldsOptions as HostedPaymentFieldsOptions,
    BlueSnapDirectStyleDeclaration as StyleDeclaration,
} from './types';

export default class BluesnapDirectNameOnCardInput {
    private _input?: HTMLInputElement;
    private _style?: BlueSnapDirectStyle;

    attach(
        {
            style,
            onFieldEventHandler: { onFocus, onBlur, onValid, onError, onEnter } = {},
        }: HostedPaymentFieldsOptions,
        accessibilityLabel?: string,
        placeholder?: string,
    ): void {
        this._style = style;

        this._create();

        this._getInput().addEventListener('focus', this._handleFocus(onFocus));
        this._getInput().addEventListener('blur', this._handleBlur(onBlur, onValid, onError));
        this._getInput().addEventListener('enter', this._handleEnter(onEnter));

        if (accessibilityLabel) {
            this._getInput().setAttribute('aria-label', accessibilityLabel);
        }

        if (placeholder) {
            this._getInput().placeholder = placeholder;
        }

        document.querySelector('[data-bluesnap="noc"]')?.appendChild(this._getInput());
    }

    getValue(): string {
        return this._getInput().value;
    }

    detach(): void {
        this._getInput().remove();
        this._input = undefined;
    }

    private _handleFocus(
        onFocus: Required<HostedPaymentFieldsOptions>['onFieldEventHandler']['onFocus'],
    ): (event: Event) => void {
        return () => {
            this._applyStyles(this._style?.[':focus']);

            onFocus?.(HostedFieldTagId.CardName);
        };
    }

    private _handleBlur(
        onBlur: Required<HostedPaymentFieldsOptions>['onFieldEventHandler']['onBlur'],
        onValid: Required<HostedPaymentFieldsOptions>['onFieldEventHandler']['onValid'],
        onError: Required<HostedPaymentFieldsOptions>['onFieldEventHandler']['onError'],
    ): (event: Event) => void {
        return ({ target }) => {
            onBlur?.(HostedFieldTagId.CardName);

            if (target instanceof HTMLInputElement) {
                if (/\w{1,200}/.test(target.value)) {
                    this._applyStyles(this._style?.input);

                    onValid?.(HostedFieldTagId.CardName);
                } else {
                    this._applyStyles(this._style?.['.invalid']);

                    onError?.(
                        HostedFieldTagId.CardName,
                        ErrorCode.INVALID_OR_EMPTY,
                        ErrorDescription.EMPTY,
                        EventOrigin.ON_BLUR,
                    );
                }
            }
        };
    }

    private _handleEnter(
        onEnter: Required<HostedPaymentFieldsOptions>['onFieldEventHandler']['onEnter'],
    ): (event: Event) => void {
        return () => onEnter?.(HostedFieldTagId.CardName);
    }

    private _applyStyles(styles: StyleDeclaration = {}): void {
        const allowedStyle: AllowedStyle = {
            color: styles.color,
            fontFamily: styles['font-family'],
            fontSize: styles['font-size'],
            fontWeight: styles['font-weight'],
        };
        const styleKeys = Object.keys(allowedStyle);

        if (isArrayOfAllowedProps(styleKeys)) {
            styleKeys.forEach((key) => {
                if (!allowedStyle[key]) {
                    return;
                }

                this._getInput().style[key] = allowedStyle[key] || '';
            });
        }
    }

    private _configureInput(): void {
        this._getInput().autocomplete = 'cc-name';
        this._getInput().id = HostedFieldTagId.CardName;
        this._getInput().inputMode = 'text';
        this._getInput().maxLength = 200;
        this._getInput().style.backgroundColor = 'transparent';
        this._getInput().style.border = '0';
        this._getInput().style.height = '100%';
        this._getInput().style.margin = '0';
        this._getInput().style.outline = 'none';
        this._getInput().style.padding = '0';
        this._getInput().style.width = '100%';
        this._getInput().type = 'text';
    }

    private _getInput(): HTMLInputElement {
        return guard(
            this._input,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _create(): void {
        this._input = document.createElement('input');
        this._configureInput();
        this._applyStyles(this._style?.input);
    }
}
