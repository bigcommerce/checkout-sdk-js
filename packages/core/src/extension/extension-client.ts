import { Consignment } from '../shipping';

export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
}

export enum ExtensionEventType {
    ShippingCountryChanged = 'EXTENSION:SHIPPING_COUNTRY_CHANGED',
    ConsignmentsChanged = 'EXTENSION:CONSIGNMENTS_CHANGED',
}

export interface ShippingCountryChangedEvent {
    type: ExtensionEventType.ShippingCountryChanged;
    payload: {
        consignmentId: string;
        countryCode: string;
    };
}

export interface ConsignmentsChangedEvent {
    type: ExtensionEventType.ConsignmentsChanged;
    payload: {
        consignments: Consignment[];
        previousConsignments: Consignment[];
    };
}

export type ExtensionEvent = ShippingCountryChangedEvent | ConsignmentsChangedEvent;

export interface ExtensionEventMap {
    [ExtensionEventType.ShippingCountryChanged]: ShippingCountryChangedEvent;
    [ExtensionEventType.ConsignmentsChanged]: ConsignmentsChangedEvent;
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
