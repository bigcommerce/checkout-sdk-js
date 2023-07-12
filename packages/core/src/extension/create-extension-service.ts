import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import ExtensionService from './extension-service';

export interface CreateExtensionServiceOptions {
    extensionId: number;
    parentOrigin: string;
}

export const enum ExtensionListenEventType {
    BroadcastCart = 'BROADCAST_CART',
    ShippingCountryChange = 'SHIPPING_COUNTRY_CHANGE',
}

export interface ExtensionListenEventMap {
    [ExtensionListenEventType.BroadcastCart]: {
        type: ExtensionListenEventType.BroadcastCart;
    };
    [ExtensionListenEventType.ShippingCountryChange]: {
        type: ExtensionListenEventType.ShippingCountryChange;
        payload: {
            countryCode: string;
        };
    };
}

export const enum ExtensionPostEventType {
    FRAME_LOADED = 'FRAME_LOADED',
    RELOAD_CHECKOUT = 'RELOAD_CHECKOUT',
    SHOW_LOADING_INDICATOR = 'SHOW_LOADING_INDICATOR',
}

export interface BaseEventPayload {
    payload: {
        extensionId?: number;
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

export default function initializeExtensionService(options: CreateExtensionServiceOptions) {
    const { extensionId, parentOrigin } = options;

    const extension = new ExtensionService(
        new IframeEventListener<ExtensionListenEventMap>(parentOrigin),
        new IframeEventPoster<ExtensionPostEvent>(parentOrigin),
    );

    extension.initialize(extensionId);
    extension.post({ type: ExtensionPostEventType.FRAME_LOADED, payload: { extensionId } });

    return extension;
}
