import HostedFieldType from './hosted-field-type';
import { HostedFieldStylesMap } from './hosted-form-options';
import HostedFormOrderData from './hosted-form-order-data';

export enum HostedFieldEventType {
    AttachRequested = 'HOSTED_FIELD:ATTACH_REQUESTED',
    SubmitRequested = 'HOSTED_FIELD:SUBMITTED_REQUESTED',
}

export interface HostedFieldEventMap {
    [HostedFieldEventType.AttachRequested]: HostedFieldAttachEvent;
    [HostedFieldEventType.SubmitRequested]: HostedFieldSubmitRequestEvent;
}

export type HostedFieldEvent = (
    HostedFieldAttachEvent |
    HostedFieldSubmitRequestEvent
);

export interface HostedFieldAttachEvent {
    type: HostedFieldEventType.AttachRequested;
    payload: {
        accessibilityLabel?: string;
        placeholder?: string;
        styles?: HostedFieldStylesMap;
        type: HostedFieldType;
    };
}

export interface HostedFieldSubmitRequestEvent {
    type: HostedFieldEventType.SubmitRequested;
    payload: {
        data: HostedFormOrderData;
        fields: HostedFieldType[];
    };
}
