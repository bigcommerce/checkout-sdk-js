export enum ExtensionInternalEventType {
    ExtensionReady = 'EXTENSION:READY',
    ExtensionFailed = 'EXTENSION:FAILED',
}

export interface ExtensionReadyEvent {
    type: ExtensionInternalEventType.ExtensionReady;
}

export interface ExtensionFailedEvent {
    type: ExtensionInternalEventType.ExtensionFailed;
}

export type ExtensionInternalEvent = ExtensionReadyEvent | ExtensionFailedEvent;

// Don't listen for these events now
// export interface ExtensionInternalEventMap {
//     [ExtensionInternalEventType.ExtensionReady]: ExtensionReadyEvent;
//     [ExtensionInternalEventType.ExtensionFailed]: ExtensionFailedEvent;
// }
