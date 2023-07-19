export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
}

export enum ExtensionListenEventType {
    CheckoutLoaded = 'CHECKOUT_LOADED',
    ShippingCountryChange = 'SHIPPING_COUNTRY_CHANGE',
}

export interface CheckoutLoadedEvent {
    type: ExtensionListenEventType.CheckoutLoaded;
}

export interface ShippingCountryChangeEvent {
    type: ExtensionListenEventType.CheckoutLoaded;
    payload: {
        countryCode: string;
    };
}

export interface ExtensionListenEventMap {
    [ExtensionListenEventType.CheckoutLoaded]: CheckoutLoadedEvent;
    [ExtensionListenEventType.ShippingCountryChange]: ShippingCountryChangeEvent;
}

export enum ExtensionCommandType {
    FRAME_LOADED = 'FRAME_LOADED',
    RELOAD_CHECKOUT = 'RELOAD_CHECKOUT',
    SHOW_LOADING_INDICATOR = 'SHOW_LOADING_INDICATOR',
}

export interface BaseEventPayload {
    payload: {
        extensionId?: string;
    };
}

export interface ExtensionReloadCommand extends BaseEventPayload {
    type: ExtensionCommandType.RELOAD_CHECKOUT;
}

export interface ExtensionShowLoadingIndicatorCommand extends BaseEventPayload {
    type: ExtensionCommandType.SHOW_LOADING_INDICATOR;
}

export interface ExtensionFrameLoadedCommand extends BaseEventPayload {
    type: ExtensionCommandType.FRAME_LOADED;
}

export type ExtensionPostCommand =
    | ExtensionReloadCommand
    | ExtensionShowLoadingIndicatorCommand
    | ExtensionFrameLoadedCommand;
