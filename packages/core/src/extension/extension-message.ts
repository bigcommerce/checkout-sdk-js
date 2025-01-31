import { Consignment } from '../shipping';

import { ExtensionCommand } from './extension-commands';
import { ExtensionEvent } from './extension-events';
import { ExtensionQuery } from './extension-queries';

export const enum ExtensionMessageType {
    GetConsignments = 'EXTENSION:GET_CONSIGNMENTS',
}

export interface GetConsignmentsMessage {
    type: ExtensionMessageType.GetConsignments;
    payload: {
        consignments: Consignment[];
    };
}

export type ExtensionMessage = ExtensionEvent | GetConsignmentsMessage;

export interface ExtensionMessageMap {
    [ExtensionMessageType.GetConsignments]: GetConsignmentsMessage;
}

export interface ExtensionCommandOrQueryContext {
    extensionId: string;
}

export type ExtensionCommandOrQuery = ExtensionCommand | ExtensionQuery;
