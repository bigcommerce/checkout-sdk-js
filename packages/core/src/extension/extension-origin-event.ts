export interface ExtensionOriginEvent {
    type: ExtensionCommand;
    payload: PayloadByType[ExtensionCommand];
}

export type ExtensionCommand = 'RELOAD_CHECKOUT' | 'SHOW_LOADING_INDICATOR' | 'SET_IFRAME_STYLE';

interface PayloadByType {
    RELOAD_CHECKOUT: ExtensionCommandPayload;
    SHOW_LOADING_INDICATOR: ShowLoadingIndicatorPayload;
    SET_IFRAME_STYLE: SetIframeStylePayload;
}

interface ExtensionCommandPayload {
    extensionId: string;
}

interface ShowLoadingIndicatorPayload extends ExtensionCommandPayload {
    show: boolean;
}

interface SetIframeStylePayload extends ExtensionCommandPayload {
    style: {
        [key: string]: string | number | null;
    };
}
