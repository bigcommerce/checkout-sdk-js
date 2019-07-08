export interface MutationObeserverCreator {
    prototype: MutationObserver;
    new(callback: MutationCallback): MutationObserver;
}

export interface MutationObserverWindow extends Window {
    MutationObserver: MutationObeserverCreator;
}

export class MutationObserverFactory {
    constructor(
        private _window: MutationObserverWindow = window as MutationObserverWindow
    ) {}

    create(callback: MutationCallback): MutationObserver {
        return new this._window.MutationObserver(callback);
    }
}
