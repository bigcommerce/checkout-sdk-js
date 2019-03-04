import { parseUrl } from '../common/url';

export default class IframeEventPoster<TEvent> {
    private _targetOrigin: string;

    constructor(
        targetOrigin: string,
        private _targetWindow?: Window
    ) {
        this._targetOrigin = targetOrigin === '*' ? '*' : parseUrl(targetOrigin).origin;
    }

    post(event: TEvent): void {
        if (window === this._targetWindow) {
            return;
        }

        if (!this._targetWindow) {
            throw new Error('Unable to post message becauset target window is not set.');
        }

        this._targetWindow.postMessage(event, this._targetOrigin);
    }

    setTarget(window: Window) {
        this._targetWindow = window;
    }
}
