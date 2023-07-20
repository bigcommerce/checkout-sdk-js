export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
}

export enum ExtensionEventType {
    CheckoutLoaded = 'CHECKOUT_LOADED',
    ShippingCountryChange = 'SHIPPING_COUNTRY_CHANGE',
}

export interface CheckoutLoadedEvent {
    type: ExtensionEventType.CheckoutLoaded;
}

export interface ShippingCountryChangeEvent {
    type: ExtensionEventType.ShippingCountryChange;
    payload: {
        countryCode: string;
    };
}
export type ExtensionEvent = CheckoutLoadedEvent | ShippingCountryChangeEvent;

export interface ExtensionEventMap {
    [ExtensionEventType.CheckoutLoaded]: CheckoutLoadedEvent;
    [ExtensionEventType.ShippingCountryChange]: ShippingCountryChangeEvent;
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

export type ExtensionCommand =
    | ExtensionReloadCommand
    | ExtensionShowLoadingIndicatorCommand
    | ExtensionFrameLoadedCommand;
