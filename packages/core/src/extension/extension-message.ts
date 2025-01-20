import { Consignment } from '../shipping';

import { ExtensionEvent } from './extension-events';

export const enum ExtensionMessageType {
    CurrentConsignments = 'EXTENSION:CURRENT_CONSIGNMENTS',
}

export interface CurrentConsignmentsMessage {
    type: ExtensionMessageType.CurrentConsignments;
    payload: {
        consignments: Consignment[];
    };
}

export type ExtensionMessage = ExtensionEvent | CurrentConsignmentsMessage;
