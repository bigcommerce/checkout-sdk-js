import { ExtensionEventType } from './extension-events';

export enum ExtensionInternalCommandType {
    Subscribe = 'EXTENSION_INTERNAL:SUBSCRIBE',
    Unsubscribe = 'EXTENSION_INTERNAL:UNSUBSCRIBE',
    ResizeIframe = 'EXTENSION_INTERNAL:RESIZE_IFRAME',
}

export interface ExtensionSubscribeCommand {
    type: ExtensionInternalCommandType.Subscribe;
    payload: {
        extensionId: string;
        eventType: ExtensionEventType;
    };
}

export interface ExtensionUnsubscribeCommand {
    type: ExtensionInternalCommandType.Unsubscribe;
    payload: {
        extensionId: string;
        eventType: ExtensionEventType;
    };
}

export interface ExtensionResizeIframeCommand {
    type: ExtensionInternalCommandType.ResizeIframe;
    payload: {
        extensionId: string;
    };
}

export interface ExtensionInternalCommandMap {
    [ExtensionInternalCommandType.Subscribe]: ExtensionSubscribeCommand;
    [ExtensionInternalCommandType.Unsubscribe]: ExtensionUnsubscribeCommand;
    [ExtensionInternalCommandType.ResizeIframe]: ExtensionResizeIframeCommand;
}

export type ExtensionInternalCommand =
    | ExtensionSubscribeCommand
    | ExtensionUnsubscribeCommand
    | ExtensionResizeIframeCommand;
