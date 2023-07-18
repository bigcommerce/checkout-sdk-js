export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
}

export enum ExtensionListenEventType {
    BroadcastCart = 'BROADCAST_CART',
    ShippingCountryChange = 'SHIPPING_COUNTRY_CHANGE',
}

export interface BroadcastCartEvent {
    type: ExtensionListenEventType.BroadcastCart;
}

export interface ShippingCountryChangeEvent {
    type: ExtensionListenEventType.BroadcastCart;
    payload: {
        countryCode: string;
    };
}

export interface ExtensionListenEventMap {
    [ExtensionListenEventType.BroadcastCart]: BroadcastCartEvent;
    [ExtensionListenEventType.ShippingCountryChange]: ShippingCountryChangeEvent;
}

export enum ExtensionPostEventType {
    FRAME_LOADED = 'FRAME_LOADED',
    RELOAD_CHECKOUT = 'RELOAD_CHECKOUT',
    SHOW_LOADING_INDICATOR = 'SHOW_LOADING_INDICATOR',
}

export interface BaseEventPayload {
    payload: {
        extensionId?: string;
    };
}

export interface ExtensionReloadEvent extends BaseEventPayload {
    type: ExtensionPostEventType.RELOAD_CHECKOUT;
}

export interface ExtensionShowLoadingIndicatorEvent extends BaseEventPayload {
    type: ExtensionPostEventType.SHOW_LOADING_INDICATOR;
}

export interface ExtensionFrameLoadedEvent extends BaseEventPayload {
    type: ExtensionPostEventType.FRAME_LOADED;
}

export type ExtensionPostEvent =
    | ExtensionReloadEvent
    | ExtensionShowLoadingIndicatorEvent
    | ExtensionFrameLoadedEvent;
