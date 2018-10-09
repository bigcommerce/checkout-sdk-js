export default class IframeEventPoster<TEvent> {
    constructor(
        private _targetOrigin: string,
        private _targetWindow: Window
    ) {}

    post(event: TEvent): void {
        if (window === this._targetWindow) {
            return;
        }

        this._targetWindow.postMessage(event, this._targetOrigin);
    }
}
