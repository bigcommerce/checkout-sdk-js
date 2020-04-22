import { kebabCase } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { parseUrl } from '../../common/url';
import { HostedFieldEventMap, HostedFieldEventType, HostedFieldValidateRequestEvent } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import HostedInputStyles, { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';
import HostedInputWindow from './hosted-input-window';

export default class HostedInput {
    protected _input: HTMLInputElement;
    protected _previousValue?: string;
    private _fontLinks?: HTMLLinkElement[];
    private _isTouched: boolean = false;

    /**
     * @internal
     */
    constructor(
        protected _type: HostedFieldType,
        protected _form: HTMLFormElement,
        protected _placeholder: string,
        protected _accessibilityLabel: string,
        protected _autocomplete: string,
        protected _styles: HostedInputStylesMap,
        protected _fontUrls: string[],
        protected _eventListener: IframeEventListener<HostedFieldEventMap>,
        protected _eventPoster: IframeEventPoster<HostedInputEvent>,
        protected _inputAggregator: HostedInputAggregator,
        protected _inputValidator: HostedInputValidator,
        protected _paymentHandler: HostedInputPaymentHandler
    ) {
        this._input = document.createElement('input');

        this._input.addEventListener('input', this._handleInput);
        this._input.addEventListener('blur', this._handleBlur);
        this._input.addEventListener('focus', this._handleFocus);
        this._eventListener.addListener(HostedFieldEventType.ValidateRequested, this._handleValidate);
        this._eventListener.addListener(HostedFieldEventType.SubmitRequested, this._paymentHandler.handle);

        this._configureInput();
    }

    getType(): HostedFieldType {
        return this._type;
    }

    getValue(): string {
        return this._input.value;
    }

    setValue(value: string): void {
        this._processChange(value);
    }

    isTouched(): boolean {
        return this._isTouched;
    }

    attach(): void {
        this._form.appendChild(this._input);
        this._form.addEventListener('submit', this._handleSubmit);

        this._loadFonts();

        this._eventPoster.setTarget(window.parent);
        this._eventListener.listen();

        // Assign itself to the global so it can be accessed by its sibling frames
        (window as unknown as HostedInputWindow).hostedInput = this;

        this._eventPoster.post({ type: HostedInputEventType.AttachSucceeded });
    }

    detach(): void {
        if (this._input.parentElement) {
            this._input.parentElement.removeChild(this._input);
        }

        this._form.removeEventListener('submit', this._handleSubmit);
        this._unloadFonts();

        this._eventListener.stopListen();
    }

    protected _formatValue(value: string): void {
        this._input.value = value;
    }

    protected _notifyChange(_value: string): void {
        this._eventPoster.post({
            type: HostedInputEventType.Changed,
            payload: {
                fieldType: this._type,
            },
        });
    }

    private _configureInput(): void {
        this._input.style.backgroundColor = 'transparent';
        this._input.style.border = '0';
        this._input.style.display = 'block';
        this._input.style.height = '100%';
        this._input.style.margin = '0';
        this._input.style.outline = 'none';
        this._input.style.padding = '0';
        this._input.style.width = '100%';
        this._input.id = kebabCase(this._type);
        this._input.placeholder = this._placeholder;
        this._input.autocomplete = this._autocomplete;

        this._input.setAttribute('aria-label', this._accessibilityLabel);

        this._applyStyles(this._styles.default);
    }

    private _applyStyles(styles: HostedInputStyles = {}): void {
        const allowedStyles: { [key in keyof Required<HostedInputStyles>]: HostedInputStyles[key] } = {
            color: styles.color,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
        };
        const styleKeys = Object.keys(allowedStyles) as Array<keyof HostedInputStyles>;

        styleKeys.forEach(key => {
            if (!allowedStyles[key]) {
                return;
            }

            this._input.style[key] = allowedStyles[key] || '';
        });
    }

    private _loadFonts(): void {
        if (this._fontLinks) {
            return;
        }

        this._fontLinks = this._fontUrls
            .filter(url => parseUrl(url).hostname === 'fonts.googleapis.com')
            .filter(url => !document.querySelector(`link[href='${url}'][rel='stylesheet']`))
            .map(url => {
                const link = document.createElement('link');

                link.rel = 'stylesheet';
                link.href = url;

                document.head.appendChild(link);

                return link;
            });
    }

    private _unloadFonts(): void {
        if (!this._fontLinks) {
            return;
        }

        this._fontLinks.forEach(link => {
            if (!link.parentElement) {
                return;
            }

            link.parentElement.removeChild(link);
        });

        this._fontLinks = undefined;
    }

    private async _validateForm(): Promise<void> {
        const values = this._inputAggregator.getInputValues();
        const results = await this._inputValidator.validate(values);

        if (results.isValid) {
            this._applyStyles(this._styles.default);
        } else {
            this._applyStyles(this._styles.error);
        }

        this._eventPoster.post({
            type: HostedInputEventType.Validated,
            payload: results,
        });
    }

    private _processChange(value: string): void {
        if (value === this._previousValue) {
            return;
        }

        this._isTouched = true;

        this._formatValue(value);
        this._validateForm();
        this._notifyChange(value);

        this._previousValue = value;
    }

    private _handleInput: (event: Event) => void = event => {
        const input = event.target as HTMLInputElement;

        this._processChange(input.value);
    };

    private _handleBlur: (event: Event) => void = () => {
        this._applyStyles(this._styles.default);
        this._validateForm();

        this._eventPoster.post({
            type: HostedInputEventType.Blurred,
            payload: {
                fieldType: this._type,
            },
        });
    };

    private _handleFocus: (event: Event) => void = () => {
        this._applyStyles(this._styles.focus);

        this._eventPoster.post({
            type: HostedInputEventType.Focused,
            payload: {
                fieldType: this._type,
            },
        });
    };

    private _handleValidate: (event: HostedFieldValidateRequestEvent) => void = () => {
        this._validateForm();
    };

    private _handleSubmit: (event: Event) => void = event => {
        event.preventDefault();

        this._eventPoster.post({
            type: HostedInputEventType.Entered,
            payload: {
                fieldType: this._type,
            },
        });
    };
}
