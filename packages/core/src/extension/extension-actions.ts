import { Action } from '@bigcommerce/data-store';

import { Extension } from './extension';

export enum ExtensionActionType {
    LoadExtensionsRequested = 'LOAD_EXTENSIONS_REQUESTED',
    LoadExtensionsSucceeded = 'LOAD_EXTENSIONS_SUCCEEDED',
    LoadExtensionsFailed = 'LOAD_EXTENSIONS_FAILED',
}

export type ExtensionAction =
    | LoadExtensionsRequestedAction
    | LoadExtensionsSucceededAction
    | LoadExtensionsFailedAction;

export interface LoadExtensionsRequestedAction extends Action {
    type: ExtensionActionType.LoadExtensionsRequested;
}

export interface LoadExtensionsSucceededAction extends Action<Extension[]> {
    type: ExtensionActionType.LoadExtensionsSucceeded;
}

export interface LoadExtensionsFailedAction extends Action<Error> {
    type: ExtensionActionType.LoadExtensionsFailed;
}
