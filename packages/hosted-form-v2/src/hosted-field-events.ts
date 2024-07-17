import HostedFieldType from './hosted-field-type';
import HostedFormManualOrderData from './hosted-form-manual-order-data';
import { HostedFieldStylesMap } from './hosted-form-options';

export enum HostedFieldEventType {
    AttachRequested = 'HOSTED_FIELD:ATTACH_REQUESTED',
    SubmitManualOrderRequested = 'HOSTED_FIELD:SUBMIT_MANUAL_ORDER_REQUESTED',
    ValidateRequested = 'HOSTED_FIELD:VALIDATE_REQUESTED',
}

export interface HostedFieldEventMap {
    [HostedFieldEventType.AttachRequested]: HostedFieldAttachEvent;
    [HostedFieldEventType.SubmitManualOrderRequested]: HostedFieldSubmitManualOrderRequestEvent;
    [HostedFieldEventType.ValidateRequested]: HostedFieldValidateRequestEvent;
}

export type HostedFieldEvent =
    | HostedFieldAttachEvent
    | HostedFieldSubmitManualOrderRequestEvent
    | HostedFieldValidateRequestEvent;

export interface HostedFieldAttachEvent {
    type: HostedFieldEventType.AttachRequested;
    payload: {
        accessibilityLabel?: string;
        fontUrls?: string[];
        placeholder?: string;
        styles?: HostedFieldStylesMap;
        origin?: string;
        type: HostedFieldType;
    };
}

export interface HostedFieldSubmitManualOrderRequestEvent {
    type: HostedFieldEventType.SubmitManualOrderRequested;
    payload: {
        data: HostedFormManualOrderData;
    };
}

export interface HostedFieldValidateRequestEvent {
    type: HostedFieldEventType.ValidateRequested;
}
