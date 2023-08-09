export type ExtensionCommand =
    | ReloadCheckoutCommand
    | ShowLoadingIndicatorCommand
    | SetIframeStyleCommand
    | FrameLoadedCommand;

export const enum ExtensionCommandType {
    FrameLoaded = 'FRAME_LOADED',
    ReloadCheckout = 'RELOAD_CHECKOUT',
    ShowLoadingIndicator = 'SHOW_LOADING_INDICATOR',
    SetIframeStyle = 'SET_IFRAME_STYLE',
}

export interface FrameLoadedCommand {
    type: ExtensionCommandType.FrameLoaded;
    payload: {
        extensionId: string;
    };
}

export interface ReloadCheckoutCommand {
    type: ExtensionCommandType.ReloadCheckout;
    payload: {
        extensionId: string;
    };
}

export interface ShowLoadingIndicatorCommand {
    type: ExtensionCommandType.ShowLoadingIndicator;
    payload: {
        extensionId: string;
        show: boolean;
    };
}

export interface SetIframeStyleCommand {
    type: ExtensionCommandType.SetIframeStyle;
    payload: {
        extensionId: string;
        style: {
            [key: string]: string | number | null;
        };
    };
}

export interface ExtensionCommandMap {
    [ExtensionCommandType.FrameLoaded]: FrameLoadedCommand;
    [ExtensionCommandType.ReloadCheckout]: ReloadCheckoutCommand;
    [ExtensionCommandType.ShowLoadingIndicator]: ShowLoadingIndicatorCommand;
    [ExtensionCommandType.SetIframeStyle]: SetIframeStyleCommand;
}
