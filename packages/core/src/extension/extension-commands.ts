export type ExtensionCommand =
    | ReloadCheckoutCommand
    | ShowLoadingIndicatorCommand
    | SetIframeStyleCommand
    | FrameLoadedCommand;

export enum ExtensionCommandType {
    FrameLoaded = 'FRAME_LOADED', // TODO: Define this as internal command/event
    ReloadCheckout = 'EXTENSION:RELOAD_CHECKOUT',
    ShowLoadingIndicator = 'EXTENSION:SHOW_LOADING_INDICATOR',
    SetIframeStyle = 'EXTENSION:SET_IFRAME_STYLE',
}

export interface FrameLoadedCommand {
    type: ExtensionCommandType.FrameLoaded;
}

export interface ReloadCheckoutCommand {
    type: ExtensionCommandType.ReloadCheckout;
}

export interface ShowLoadingIndicatorCommand {
    type: ExtensionCommandType.ShowLoadingIndicator;
    payload: {
        show: boolean;
    };
}

export interface SetIframeStyleCommand {
    type: ExtensionCommandType.SetIframeStyle;
    payload: {
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
