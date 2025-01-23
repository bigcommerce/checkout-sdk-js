import { Consignment } from '../shipping';

import { ExtensionEvent } from './extension-events';

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
