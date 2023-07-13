export const enum ExtensionCommand {
    ReloadCheckout = 'RELOAD_CHECKOUT',
    ShowLoadingIndicator = 'SHOW_LOADING_INDICATOR',
    SetIframeStyle = 'SET_IFRAME_STYLE',
}

export interface ExtensionOriginEventMap {
    [ExtensionCommand.ReloadCheckout]: ReloadCheckoutEvent;
    [ExtensionCommand.ShowLoadingIndicator]: ShowLoadingIndicatorEvent;
    [ExtensionCommand.SetIframeStyle]: SetIframeStylePayload;
}

export type ExtensionOriginEvent =
    | ReloadCheckoutEvent
    | ShowLoadingIndicatorEvent
    | SetIframeStylePayload;

export interface ReloadCheckoutEvent {
    type: ExtensionCommand.ReloadCheckout;
    payload: {
        extensionId: string;
    };
}

export interface ShowLoadingIndicatorEvent {
    type: ExtensionCommand.ReloadCheckout;
    payload: {
        extensionId: string;
        show: boolean;
    };
}

export interface SetIframeStylePayload {
    type: ExtensionCommand.ReloadCheckout;
    payload: {
        extensionId: string;
        style: {
            [key: string]: string | number | null;
        };
    };
}

export function stringToExtensionCommand(command: string): ExtensionCommand | undefined {
    switch (command) {
        case 'RELOAD_CHECKOUT':
            return ExtensionCommand.ReloadCheckout;

        case 'SHOW_LOADING_INDICATOR':
            return ExtensionCommand.ShowLoadingIndicator;

        case 'SET_IFRAME_STYLE':
            return ExtensionCommand.SetIframeStyle;

        default:
            return undefined;
    }
}
