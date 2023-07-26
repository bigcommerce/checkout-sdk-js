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
    SET_IFRAME_STYLE = 'SET_IFRAME_STYLE',
    SHOW_LOADING_INDICATOR = 'SHOW_LOADING_INDICATOR',
}

export interface BaseEventPayload<T> {
    payload: T & { extensionId?: string };
}

export interface ExtensionReloadCommand extends BaseEventPayload<{}> {
    type: ExtensionCommandType.RELOAD_CHECKOUT;
}

export interface ExtensionSetIframeStyleCommand
    extends BaseEventPayload<{
        style?: {
            [key: string]: string | number | null;
        };
    }> {
    type: ExtensionCommandType.SET_IFRAME_STYLE;
}

export interface ExtensionShowLoadingIndicatorCommand extends BaseEventPayload<{ show?: boolean }> {
    type: ExtensionCommandType.SHOW_LOADING_INDICATOR;
}

export interface ExtensionFrameLoadedCommand extends BaseEventPayload<{}> {
    type: ExtensionCommandType.FRAME_LOADED;
}

export type ExtensionCommand =
    | ExtensionReloadCommand
    | ExtensionShowLoadingIndicatorCommand
    | ExtensionFrameLoadedCommand
    | ExtensionSetIframeStyleCommand;
