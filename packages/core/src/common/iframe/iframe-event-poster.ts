import { fromEvent } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { parseUrl } from '../url';

import IframeEvent from './iframe-event';
import isIframeEvent from './is-iframe-event';

export interface IframeEventPostOptions<
    TSuccessEvent extends IframeEvent,
    TErrorEvent extends IframeEvent,
> {
    errorType?: TErrorEvent['type'];
    successType?: TSuccessEvent['type'];
}

export default class IframeEventPoster<TEvent> {
    private _targetOrigin = '*';

    constructor(targetOrigin: string, private _targetWindow?: Window) {
        this.setTargetOrigin(targetOrigin);
    }

    post(event: TEvent): void;
    post<
        TSuccessEvent extends IframeEvent = IframeEvent,
        TErrorEvent extends IframeEvent = IframeEvent,
    >(
        event: TEvent,
        options: IframeEventPostOptions<TSuccessEvent, TErrorEvent>,
    ): Promise<TSuccessEvent>;
    post<
        TSuccessEvent extends IframeEvent = IframeEvent,
        TErrorEvent extends IframeEvent = IframeEvent,
    >(
        event: TEvent,
        options?: IframeEventPostOptions<TSuccessEvent, TErrorEvent>,
    ): Promise<TSuccessEvent> | void {
        const targetWindow = this._targetWindow;

        if (window === targetWindow) {
            return;
        }

        if (!targetWindow) {
            throw new Error('Unable to post message because target window is not set.');
        }

        const result =
            options &&
            fromEvent<MessageEvent>(window, 'message')
                .pipe(
                    filter(
                        (event) =>
                            event.origin === this._targetOrigin &&
                            isIframeEvent(event.data, event.data.type) &&
                            [options.successType, options.errorType].indexOf(event.data.type) !==
                                -1,
                    ),
                    map((event) => {
                        if (options.errorType === event.data.type) {
                            throw event.data;
                        }

                        return event.data;
                    }),
                    take(1),
                )
                .toPromise();

        targetWindow.postMessage(event, this._targetOrigin);

        return result;
    }

    setTarget(window: Window) {
        this._targetWindow = window;
    }

    setTargetOrigin(targetOrigin: string) {
        this._targetOrigin = targetOrigin === '*' ? '*' : parseUrl(targetOrigin).origin;
    }
}
