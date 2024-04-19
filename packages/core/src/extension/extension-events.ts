import { Consignment } from '../shipping';

export enum ExtensionEventType {
    ConsignmentsChanged = 'EXTENSION:CONSIGNMENTS_CHANGED',
}

export interface ConsignmentsChangedEvent {
    type: ExtensionEventType.ConsignmentsChanged;
    payload: {
        consignments: Consignment[];
        previousConsignments: Consignment[];
    };
}

export type ExtensionEvent = ConsignmentsChangedEvent;

export interface ExtensionEventMap {
    [ExtensionEventType.ConsignmentsChanged]: ConsignmentsChangedEvent;
}
