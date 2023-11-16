import { CardInstrument } from '../payment/instrument';

import HostedFieldType from './hosted-field-type';
import { HostedFieldStylesMap } from './hosted-form-options';
import HostedFormOrderData from './hosted-form-order-data';
import { HostedFormVaultingData, HostedFormVaultingInstrumentFields } from './hosted-form-vaulting';

export enum HostedFieldEventType {
    AttachRequested = 'HOSTED_FIELD:ATTACH_REQUESTED',
    SubmitRequested = 'HOSTED_FIELD:SUBMITTED_REQUESTED',
    ValidateRequested = 'HOSTED_FIELD:VALIDATE_REQUESTED',
    VaultingRequested = 'HOSTED_FIELD:VAULTING_REQUESTED',
}

export interface HostedFieldEventMap {
    [HostedFieldEventType.AttachRequested]: HostedFieldAttachEvent;
    [HostedFieldEventType.SubmitRequested]: HostedFieldSubmitRequestEvent;
    [HostedFieldEventType.ValidateRequested]: HostedFieldValidateRequestEvent;
    [HostedFieldEventType.VaultingRequested]: HostedFieldVaultingRequestEvent;
}

export type HostedFieldEvent =
    | HostedFieldAttachEvent
    | HostedFieldSubmitRequestEvent
    | HostedFieldValidateRequestEvent
    | HostedFieldVaultingRequestEvent;

export interface HostedFieldAttachEvent {
    type: HostedFieldEventType.AttachRequested;
    payload: {
        accessibilityLabel?: string;
        cardInstrument?: CardInstrument;
        fontUrls?: string[];
        placeholder?: string;
        styles?: HostedFieldStylesMap;
        origin?: string;
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

export interface HostedFieldValidateRequestEvent {
    type: HostedFieldEventType.ValidateRequested;
}

export interface HostedFieldVaultingRequestEvent {
    type: HostedFieldEventType.VaultingRequested;
    payload: {
        data: HostedFormVaultingData;
        fields: HostedFormVaultingInstrumentFields;
    };
}
