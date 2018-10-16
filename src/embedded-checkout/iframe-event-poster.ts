export default class IframeEventPoster<TEvent> {
    constructor(
        private _targetOrigin: string,
        private _targetWindow?: Window
    ) {}

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
