export type ExtensionCommand =
    | ReloadCheckoutCommand
    | ShowLoadingIndicatorCommand
    | SetIframeStyleCommand
    | GetConsignmentsCommand;

export enum InstantDataCommandType {
    Consignments = 'consignments',
}

export enum ExtensionCommandType {
    ReloadCheckout = 'EXTENSION:RELOAD_CHECKOUT',
    ShowLoadingIndicator = 'EXTENSION:SHOW_LOADING_INDICATOR',
    SetIframeStyle = 'EXTENSION:SET_IFRAME_STYLE',
    GetConsignments = 'EXTENSION:GET_CONSIGNMENTS',
}

export interface ExtensionCommandContext {
    extensionId: string;
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

export interface GetConsignmentsCommand {
    type: ExtensionCommandType.GetConsignments;
}

export interface ExtensionCommandMap {
    [ExtensionCommandType.ReloadCheckout]: ReloadCheckoutCommand;
    [ExtensionCommandType.ShowLoadingIndicator]: ShowLoadingIndicatorCommand;
    [ExtensionCommandType.SetIframeStyle]: SetIframeStyleCommand;
    [ExtensionCommandType.GetConsignments]: GetConsignmentsCommand;
}
