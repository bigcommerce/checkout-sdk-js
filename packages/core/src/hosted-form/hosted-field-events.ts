import { CardInstrument } from '../payment/instrument';

import HostedFieldType from './hosted-field-type';
import { HostedFieldStylesMap } from './hosted-form-options';
import HostedFormOrderData from './hosted-form-order-data';
import {
    StoredCardHostedFormData,
    StoredCardHostedFormInstrumentFields,
} from './stored-card-hosted-form-type';

export enum HostedFieldEventType {
    AttachRequested = 'HOSTED_FIELD:ATTACH_REQUESTED',
    SubmitRequested = 'HOSTED_FIELD:SUBMITTED_REQUESTED',
    ValidateRequested = 'HOSTED_FIELD:VALIDATE_REQUESTED',
    StoredCardRequested = 'HOSTED_FIELD:STORED_CARD_REQUESTED',
}

export interface HostedFieldEventMap {
    [HostedFieldEventType.AttachRequested]: HostedFieldAttachEvent;
    [HostedFieldEventType.SubmitRequested]: HostedFieldSubmitRequestEvent;
    [HostedFieldEventType.ValidateRequested]: HostedFieldValidateRequestEvent;
    [HostedFieldEventType.StoredCardRequested]: HostedFieldStoredCardRequestEvent;
}

export type HostedFieldEvent =
    | HostedFieldAttachEvent
    | HostedFieldSubmitRequestEvent
    | HostedFieldValidateRequestEvent
    | HostedFieldStoredCardRequestEvent;

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

export interface HostedFieldStoredCardRequestEvent {
    type: HostedFieldEventType.StoredCardRequested;
    payload: {
        data: StoredCardHostedFormData;
        fields: StoredCardHostedFormInstrumentFields;
    };
}
