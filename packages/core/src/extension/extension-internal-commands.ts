import { ExtensionEventType } from './extension-client';

export enum ExtensionInternalCommandType {
    Subscribe = 'EXTENSION_INTERNAL:SUBSCRIBE',
    Unsubscribe = 'EXTENSION_INTERNAL:UNSUBSCRIBE',
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

export interface ExtensionInternalCommandMap {
    [ExtensionInternalCommandType.Subscribe]: ExtensionSubscribeCommand;
    [ExtensionInternalCommandType.Unsubscribe]: ExtensionUnsubscribeCommand;
}

export type ExtensionInternalCommand = ExtensionSubscribeCommand | ExtensionUnsubscribeCommand;
