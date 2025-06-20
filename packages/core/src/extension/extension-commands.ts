export type ExtensionCommand =
    | ReloadCheckoutCommand
    | ShowLoadingIndicatorCommand
    | SetIframeStyleCommand
    | ReRenderShippingForm
    | ReRenderShippingStep;

export enum ExtensionCommandType {
    ReloadCheckout = 'EXTENSION:RELOAD_CHECKOUT',
    ShowLoadingIndicator = 'EXTENSION:SHOW_LOADING_INDICATOR',
    SetIframeStyle = 'EXTENSION:SET_IFRAME_STYLE',
    ReRenderShippingForm = 'EXTENSION:RE_RENDER_SHIPPING_FORM',
    ReRenderShippingStep = 'EXTENSION:RE_RENDER_SHIPPING_STEP',
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

export interface ReRenderShippingForm {
    type: ExtensionCommandType.ReRenderShippingForm;
}

export interface ReRenderShippingStep {
    type: ExtensionCommandType.ReRenderShippingStep;
}
export interface ExtensionCommandMap {
    [ExtensionCommandType.ReloadCheckout]: ReloadCheckoutCommand;
    [ExtensionCommandType.ShowLoadingIndicator]: ShowLoadingIndicatorCommand;
    [ExtensionCommandType.SetIframeStyle]: SetIframeStyleCommand;
    [ExtensionCommandType.ReRenderShippingForm]: ReRenderShippingForm;
    [ExtensionCommandType.ReRenderShippingStep]: ReRenderShippingStep;
}
