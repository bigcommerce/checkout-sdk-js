import { InvalidArgumentError } from '../../../common/error/errors';

import {
    BraintreeFormFieldOptions,
    BraintreeFormFieldStyles,
    BraintreeFormFieldStylesMap,
} from './braintree-payment-options';

export default class BraintreeRegularField {
    private _input: HTMLInputElement;

    constructor(
        private _options: BraintreeFormFieldOptions,
        private _styles?: BraintreeFormFieldStylesMap,
    ) {
        this._input = document.createElement('input');
        this._input.style.backgroundColor = 'transparent';
        this._input.style.border = '0';
        this._input.style.display = 'block';
        this._input.style.height = '100%';
        this._input.style.margin = '0';
        this._input.style.outline = 'none';
        this._input.style.padding = '0';
        this._input.style.width = '100%';
        this._input.placeholder = this._options.placeholder || '';

        this._input.setAttribute('aria-label', this._options.accessibilityLabel || '');

        this._input.addEventListener('blur', this._handleBlur);
        this._input.addEventListener('focus', this._handleFocus);

        this._applyStyles(this._styles?.default);
    }

    getValue(): string {
        return this._input.value;
    }

    attach(): void {
        const container = document.getElementById(this._options.containerId);

        if (!container) {
            throw new InvalidArgumentError();
        }

        container.appendChild(this._input);
    }

    detach(): void {
        this._input.parentNode?.removeChild(this._input);
    }

    on(event: string, callback: () => void): void {
        this._input.addEventListener(event, callback);
    }

    off(event: string, callback: () => void): void {
        this._input.removeEventListener(event, callback);
    }

    private _applyStyles(styles?: BraintreeFormFieldStyles): void {
        if (!styles) {
            return;
        }

        const styleKeys = Object.keys(styles) as Array<keyof BraintreeFormFieldStyles>;

        styleKeys.forEach((key) => {
            this._input.style[key] = styles[key] || '';
        });
    }

    private _handleBlur: (event: Event) => void = () => {
        this._applyStyles(this._styles?.default);
    };

    private _handleFocus: (event: Event) => void = () => {
        this._applyStyles(this._styles?.focus);
    };
}
