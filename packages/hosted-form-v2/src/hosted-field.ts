import { values } from 'lodash';
import { fromEvent } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { DetachmentObserver } from './common/dom';
import { mapFromPaymentErrorResponse } from './common/errors';
import { IframeEventListener, IframeEventPoster } from './common/iframe';
import { parseUrl } from './common/url';
import {
    InvalidHostedFormConfigError,
    InvalidHostedFormError,
    InvalidHostedFormValueError,
} from './errors';
import { HostedFieldEvent, HostedFieldEventType } from './hosted-field-events';
import HostedFieldType from './hosted-field-type';
import HostedFormManualOrderData from './hosted-form-manual-order-data';
import { HostedFieldStylesMap } from './hosted-form-options';
import HostedFormOrderData from './hosted-form-order-data';
import {
    HostedInputEventMap,
    HostedInputEventType,
    HostedInputStoredCardSucceededEvent,
    HostedInputSubmitErrorEvent,
    HostedInputSubmitManualOrderErrorEvent,
    HostedInputSubmitManualOrderSuccessEvent,
    HostedInputSubmitSuccessEvent,
    HostedInputValidateEvent,
} from './iframe-content';
import {
    StoredCardHostedFormData,
    StoredCardHostedFormInstrumentFields,
} from './stored-card-hosted-form-type';

export const RETRY_INTERVAL = 60 * 1000;
export const LAST_RETRY_KEY = 'lastRetry';

export default class HostedField {
    private _iframe: HTMLIFrameElement;

    constructor(
        private _type: HostedFieldType,
        private _containerId: string,
        private _placeholder: string,
        private _accessibilityLabel: string,
        private _styles: HostedFieldStylesMap,
        private _eventPoster: IframeEventPoster<HostedFieldEvent>,
        private _eventListener: IframeEventListener<HostedInputEventMap>,
        private _detachmentObserver: DetachmentObserver,
        private _orderId?: number,
    ) {
        this._iframe = document.createElement('iframe');

        this._iframe.src = this.getFrameSrc(this._orderId);
        this._iframe.style.border = 'none';
        this._iframe.style.height = '100%';
        this._iframe.style.overflow = 'hidden';
        this._iframe.style.width = '100%';
    }

    private getFrameSrc(orderId?: number): string {
        return typeof orderId !== 'undefined'
            ? `/admin/payments/${this._orderId}/hosted-form-field?version=${LIBRARY_VERSION}`
            : `/account/stored-instruments/hosted-fields?version=${LIBRARY_VERSION}`;
    }

    getType(): HostedFieldType {
        return this._type;
    }

    async attach(): Promise<void> {
        const container = document.getElementById(this._containerId);

        if (!container) {
            throw new InvalidHostedFormConfigError(
                'Unable to proceed because the provided container ID is not valid.',
            );
        }

        container.appendChild(this._iframe);
        this._eventListener.listen();

        const promise = fromEvent(this._iframe, 'load')
            .pipe(
                switchMap(async ({ target }) => {
                    const contentWindow = target && (target as HTMLIFrameElement).contentWindow;

                    if (!contentWindow) {
                        throw new Error('The content window of the iframe cannot be accessed.');
                    }

                    this._eventPoster.setTarget(contentWindow);

                    await this._eventPoster.post(
                        {
                            type: HostedFieldEventType.AttachRequested,
                            payload: {
                                accessibilityLabel: this._accessibilityLabel,
                                fontUrls: this._getFontUrls(),
                                placeholder: this._placeholder,
                                styles: this._styles,
                                origin: document.location.origin,
                                type: this._type,
                            },
                        },
                        {
                            successType: HostedInputEventType.AttachSucceeded,
                            errorType: HostedInputEventType.AttachFailed,
                        },
                    );
                }),
                take(1),
            )
            .toPromise();

        await this._detachmentObserver.ensurePresence([this._iframe], promise);
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
        data: HostedFormOrderData,
    ): Promise<HostedInputSubmitSuccessEvent> {
        try {
            const promise = this._eventPoster.post<HostedInputSubmitSuccessEvent>(
                {
                    type: HostedFieldEventType.SubmitRequested,
                    payload: { fields, data },
                },
                {
                    successType: HostedInputEventType.SubmitSucceeded,
                    errorType: HostedInputEventType.SubmitFailed,
                },
            );

            return await this._detachmentObserver.ensurePresence([this._iframe], promise);
        } catch (event) {
            if (this._isSubmitErrorEvent(event)) {
                if (event.payload.error.code === 'hosted_form_error') {
                    throw new InvalidHostedFormError(event.payload.error.message);
                }

                if (event.payload.response) {
                    throw mapFromPaymentErrorResponse(event.payload.response);
                }

                throw new Error(event.payload.error.message);
            }

            throw event;
        }
    }

    async submitManualOrderForm(
        data: HostedFormManualOrderData,
    ): Promise<HostedInputSubmitManualOrderSuccessEvent> {
        try {
            const promise = this._eventPoster.post<HostedInputSubmitManualOrderSuccessEvent>(
                {
                    type: HostedFieldEventType.SubmitManualOrderRequested,
                    payload: { data },
                },
                {
                    successType: HostedInputEventType.SubmitManualOrderSucceeded,
                    errorType: HostedInputEventType.SubmitManualOrderFailed,
                },
            );

            return await this._detachmentObserver.ensurePresence([this._iframe], promise);
        } catch (event) {
            if (this._isSubmitManualOrderErrorEvent(event)) {
                if (event.payload.error.code === 'hosted_form_error') {
                    throw new InvalidHostedFormError(event.payload.error.message);
                }

                if (event.payload.error.message) {
                    throw new Error(event.payload.error.message);
                }

                throw new Error(event.payload.error.code);
            }

            throw event;
        }
    }

    async submitStoredCardForm(
        fields: StoredCardHostedFormInstrumentFields,
        data: StoredCardHostedFormData,
    ): Promise<HostedInputStoredCardSucceededEvent> {
        const promise = this._eventPoster.post<HostedInputStoredCardSucceededEvent>(
            {
                type: HostedFieldEventType.StoredCardRequested,
                payload: { fields, data },
            },
            {
                successType: HostedInputEventType.StoredCardSucceeded,
                errorType: HostedInputEventType.StoredCardFailed,
            },
        );

        return this._detachmentObserver.ensurePresence([this._iframe], promise);
    }

    async validateForm(): Promise<void> {
        const promise = this._eventPoster.post<HostedInputValidateEvent>(
            {
                type: HostedFieldEventType.ValidateRequested,
            },
            {
                successType: HostedInputEventType.Validated,
            },
        );

        const { payload } = await this._detachmentObserver.ensurePresence([this._iframe], promise);

        if (!payload.isValid) {
            throw new InvalidHostedFormValueError(payload.errors);
        }
    }

    private _getFontUrls(): string[] {
        const hostname = 'fonts.googleapis.com';
        const links = document.querySelectorAll(`link[href*='${hostname}'][rel='stylesheet']`);

        return Array.prototype.slice
            .call(links)
            .filter((link) => parseUrl(link.href).hostname === hostname)
            .filter((link) =>
                values(this._styles)
                    .map((style) => style && style.fontFamily)
                    .filter((family): family is string => typeof family === 'string')
                    .some((family) =>
                        family
                            .split(/,\s/)
                            .some((name) => link.href.indexOf(name.replace(' ', '+')) !== -1),
                    ),
            )
            .map((link) => link.href);
    }

    private _isSubmitManualOrderErrorEvent(
        event: any,
    ): event is HostedInputSubmitManualOrderErrorEvent {
        if (!(event instanceof Object) || event === null || !('type' in event)) {
            return false;
        }

        return event.type === HostedInputEventType.SubmitManualOrderFailed;
    }

    private _isSubmitErrorEvent(event: any): event is HostedInputSubmitErrorEvent {
        return event.type === HostedInputEventType.SubmitFailed;
    }
}
