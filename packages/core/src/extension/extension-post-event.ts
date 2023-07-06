export type ExtensionCommand = 'RELOAD_CHECKOUT' | 'SHOW_LOADING_INDICATOR';

export type HostCommand = 'HOST_COMMAND';

export interface ExtensionPostEvent {
    type: ExtensionCommand | HostCommand;
    payload: PayloadByType[ExtensionCommand | HostCommand];
}

interface PayloadByType {
    HOST_COMMAND: HostCommandPayload;
    RELOAD_CHECKOUT: ExtensionCommandPayload;
    SHOW_LOADING_INDICATOR: ShowLoadingIndicatorPayload;
}

interface HostCommandPayload {
    message: string;
}

interface ExtensionCommandPayload {
    extensionId: string;
}

interface ShowLoadingIndicatorPayload extends ExtensionCommandPayload {
    show: boolean;
}
