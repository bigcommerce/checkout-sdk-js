import { Action } from '@bigcommerce/data-store';

import { Extension } from './extension';

export enum ExtensionActionType {
    LoadExtensionsRequested = 'LOAD_EXTENSIONS_REQUESTED',
    LoadExtensionsSucceeded = 'LOAD_EXTENSIONS_SUCCEEDED',
    LoadExtensionsFailed = 'LOAD_EXTENSIONS_FAILED',
    RenderExtensionRequested = 'RENDER_EXTENSION_REQUESTED',
    RenderExtensionSucceeded = 'RENDER_EXTENSION_SUCCEEDED',
    RenderExtensionFailed = 'RENDER_EXTENSION_FAILED',
    ListenCommandSucceeded = 'LISTEN_COMMAND_SUCCEED',
    PostMessageSucceeded = 'POST_MESSAGE_SUCCEEDED',
    PostMessageFailed = 'POST_MESSAGE_FAILED',
}

export type ExtensionAction =
    | LoadExtensionsRequestedAction
    | LoadExtensionsSucceededAction
    | LoadExtensionsFailedAction
    | RenderExtensionRequestedAction
    | RenderExtensionSucceededAction
    | RenderExtensionFailedAction
    | ListenCommandSucceeded
    | PostMessageSucceeded
    | PostMessageFailed;

export interface LoadExtensionsRequestedAction extends Action {
    type: ExtensionActionType.LoadExtensionsRequested;
}

export interface LoadExtensionsSucceededAction extends Action<Extension[]> {
    type: ExtensionActionType.LoadExtensionsSucceeded;
}

export interface LoadExtensionsFailedAction extends Action<Error> {
    type: ExtensionActionType.LoadExtensionsFailed;
}

export interface RenderExtensionRequestedAction extends Action {
    type: ExtensionActionType.RenderExtensionRequested;
}

export interface RenderExtensionSucceededAction extends Action {
    type: ExtensionActionType.RenderExtensionSucceeded;
}

export interface RenderExtensionFailedAction extends Action<Error> {
    type: ExtensionActionType.RenderExtensionFailed;
}

export interface ListenCommandSucceeded extends Action {
    type: ExtensionActionType.ListenCommandSucceeded;
}

export interface PostMessageSucceeded extends Action {
    type: ExtensionActionType.PostMessageSucceeded;
}

export interface PostMessageFailed extends Action<Error> {
    type: ExtensionActionType.PostMessageFailed;
}
