import { fromEvent } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { IframeEventListener } from '../../common/iframe';
import { InvalidHostedFormConfigError } from '../errors';
import { HostedFieldAttachEvent, HostedFieldEventMap, HostedFieldEventType } from '../hosted-field-events';

import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';

interface EventTargetLike<TEvent> {
    addListener(eventName: string, handler: (event: TEvent) => void): void;
    removeListener(eventName: string, handler: (event: TEvent) => void): void;
}

export default class HostedInputInitializer {
    constructor(
        private _factory: HostedInputFactory,
        private _eventListener: IframeEventListener<HostedFieldEventMap>
    ) {}

    initialize(containerId: string): Promise<HostedInput> {
        const form = this._createFormContainer(containerId);

        this._resetPageStyles(containerId);
        this._eventListener.listen();

        return fromEvent<HostedFieldAttachEvent>(
            this._eventListener as EventTargetLike<HostedFieldAttachEvent>,
            HostedFieldEventType.AttachRequested
        )
            .pipe(
                map(({ payload }) => {
                    const { accessibilityLabel, cardInstrument, fontUrls, placeholder, styles, type } = payload;
                    const field = this._factory.create(form, type, styles, fontUrls, placeholder, accessibilityLabel, cardInstrument);

                    field.attach();

                    return field;
                }),
                take(1)
            )
            .toPromise();
    }

    private _resetPageStyles(containerId: string) {
        const html = document.querySelector('html');
        const body = document.querySelector('body');
        const container = document.getElementById(containerId);

        [html, body, container]
            .forEach(node => {
                if (!node) {
                    return;
                }

                node.style.height = '100%';
                node.style.width = '100%';
                node.style.overflow = 'hidden';
                node.style.padding = '0';
                node.style.margin = '0';
            });
    }

    private _createFormContainer(containerId: string): HTMLFormElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidHostedFormConfigError('Unable to proceed because the provided container ID is not valid.');
        }

        const form = document.createElement('form');
        const button = document.createElement('button');

        form.noValidate = true;
        form.style.height = '100%';
        form.style.width = '100%';
        button.style.display = 'none';

        container.appendChild(form);
        form.appendChild(button);

        return form;
    }
}
