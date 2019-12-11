import { fromEvent } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { CardInstrument } from '../payment/instrument';

import { InvalidHostedFormConfigError, InvalidHostedFormError, InvalidHostedFormValueError } from './errors';
import { HostedFieldEvent, HostedFieldEventType } from './hosted-field-events';
import HostedFieldType from './hosted-field-type';
import { HostedFieldStylesMap } from './hosted-form-options';
import HostedFormOrderData from './hosted-form-order-data';
import { HostedInputAttachErrorEvent, HostedInputEventMap, HostedInputEventType, HostedInputSubmitErrorEvent, HostedInputValidateEvent } from './iframe-content';

export default class HostedField {
    private _iframe: HTMLIFrameElement;

    constructor(
        host: string,
        formId: string,
        private _type: HostedFieldType,
        private _containerId: string,
        private _placeholder: string,
        private _accessibilityLabel: string,
        private _styles: HostedFieldStylesMap,
        private _eventPoster: IframeEventPoster<HostedFieldEvent>,
        private _eventListener: IframeEventListener<HostedInputEventMap>,
        private _cardInstrument?: CardInstrument
    ) {
        this._iframe = document.createElement('iframe');

        this._iframe.src = `${host}/pay/hosted_forms/${formId}/field`;
        this._iframe.style.border = 'none';
        this._iframe.style.height = '100%';
        this._iframe.style.overflow = 'hidden';
        this._iframe.style.width = '100%';
    }

    getType(): HostedFieldType {
        return this._type;
    }

    attach(): Promise<void> {
        const container = document.getElementById(this._containerId);

        if (!container) {
            throw new InvalidHostedFormConfigError('Unable to proceed because the provided container ID is not valid.');
        }

        container.appendChild(this._iframe);
        this._eventListener.listen();

        return fromEvent(this._iframe, 'load')
            .pipe(
                switchMap(async ({ target }) => {
                    const contentWindow = target && (target as HTMLIFrameElement).contentWindow;

                    if (!contentWindow) {
                        throw new Error('The content window of the iframe cannot be accessed.');
                    }

                    this._eventPoster.setTarget(contentWindow);

                    await this._eventPoster.post({
                        type: HostedFieldEventType.AttachRequested,
                        payload: {
                            accessibilityLabel: this._accessibilityLabel,
                            cardInstrument: this._cardInstrument,
                            placeholder: this._placeholder,
                            styles: this._styles,
                            type: this._type,
                        },
                    }, {
                        successType: HostedInputEventType.AttachSucceeded,
                        errorType: HostedInputEventType.AttachFailed,
                    });
                }),
                catchError(error => {
                    if (this._isAttachErrorEvent(error)) {
                        throw new InvalidHostedFormError(error.payload.error.message);
                    }

                    throw error;
                }),
                take(1)
            ).toPromise();
    }

    detach(): void {
        if (!this._iframe.parentElement) {
            return;
        }

        this._iframe.parentElement.removeChild(this._iframe);
        this._eventListener.stopListen();
    }

    async submitForm(
        fields: HostedFieldType[],
        data: HostedFormOrderData
    ): Promise<void> {
        try {
            await this._eventPoster.post({
                type: HostedFieldEventType.SubmitRequested,
                payload: { fields, data },
            }, {
                successType: HostedInputEventType.SubmitSucceeded,
                errorType: HostedInputEventType.SubmitFailed,
            });
        } catch (event) {
            if (this._isSubmitErrorEvent(event) && event.payload.error.code === 'hosted_form_error') {
                throw new InvalidHostedFormError(event.payload.error.message);
            }

            throw event;
        }
    }

    async validateForm(): Promise<void> {
        const { payload } = await this._eventPoster.post<HostedInputValidateEvent>({
            type: HostedFieldEventType.ValidateRequested,
        }, {
            successType: HostedInputEventType.Validated,
        });

        if (!payload.isValid) {
            throw new InvalidHostedFormValueError(payload.errors);
        }
    }

    private _isSubmitErrorEvent(event: any): event is HostedInputSubmitErrorEvent {
        return event.type === HostedInputEventType.SubmitFailed;
    }

    private _isAttachErrorEvent(event: any): event is HostedInputAttachErrorEvent {
        return event.type === HostedInputEventType.AttachFailed;
    }
}
