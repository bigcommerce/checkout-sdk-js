import { PaymentErrorData } from '../../common/error';
import HostedFieldType from '../hosted-field-type';

import HostedInputInitializeErrorData from './hosted-input-initialize-error-data';
import HostedInputValidateErrorData from './hosted-input-validate-error-data';

// Event types
export enum HostedInputEventType {
    AttachSucceeded = 'HOSTED_INPUT:ATTACH_SUCCEEDED',
    AttachFailed = 'HOSTED_INPUT:ATTACH_FAILED',
    Blurred = 'HOSTED_INPUT:BLURRED',
    Changed = 'HOSTED_INPUT:CHANGED',
    CardTypeChanged = 'HOSTED_INPUT:CARD_TYPE_CHANGED',
    Focused = 'HOSTED_INPUT:FOCUSED',
    SubmitSucceeded = 'HOSTED_INPUT:SUBMIT_SUCCEEDED',
    SubmitFailed = 'HOSTED_INPUT:SUBMIT_FAILED',
    ValidateFailed = 'HOSTED_INPUT:VALIDATE_FAILED',
}

// Event mapping
export interface HostedInputEventMap {
    [HostedInputEventType.AttachSucceeded]: HostedInputAttachSuccessEvent;
    [HostedInputEventType.AttachFailed]: HostedInputAttachErrorEvent;
    [HostedInputEventType.Blurred]: HostedInputBlurEvent;
    [HostedInputEventType.Changed]: HostedInputChangeEvent;
    [HostedInputEventType.CardTypeChanged]: HostedInputCardTypeChangeEvent;
    [HostedInputEventType.Focused]: HostedInputFocusEvent;
    [HostedInputEventType.SubmitSucceeded]: HostedInputSubmitSuccessEvent;
    [HostedInputEventType.SubmitFailed]: HostedInputSubmitErrorEvent;
    [HostedInputEventType.ValidateFailed]: HostedInputValidateErrorEvent;
}

// Events
export type HostedInputEvent = (
    HostedInputAttachSuccessEvent |
    HostedInputAttachErrorEvent |
    HostedInputBlurEvent |
    HostedInputChangeEvent |
    HostedInputCardTypeChangeEvent |
    HostedInputFocusEvent |
    HostedInputSubmitSuccessEvent |
    HostedInputSubmitErrorEvent |
    HostedInputValidateErrorEvent
);

export interface HostedInputAttachSuccessEvent {
    type: HostedInputEventType.AttachSucceeded;
}

export interface HostedInputAttachErrorEvent {
    type: HostedInputEventType.AttachFailed;
    payload: {
        error: HostedInputInitializeErrorData;
    };
}

export interface HostedInputBlurEvent {
    type: HostedInputEventType.Blurred;
    payload: {
        fieldType: HostedFieldType;
    };
}

export interface HostedInputChangeEvent {
    type: HostedInputEventType.Changed;
    payload: {
        fieldType: HostedFieldType;
    };
}

export interface HostedInputCardTypeChangeEvent {
    type: HostedInputEventType.CardTypeChanged;
    payload: {
        cardType?: string;
    };
}

export interface HostedInputFocusEvent {
    type: HostedInputEventType.Focused;
    payload: {
        fieldType: HostedFieldType;
    };
}

export interface HostedInputSubmitSuccessEvent {
    type: HostedInputEventType.SubmitSucceeded;
}

export interface HostedInputSubmitErrorEvent {
    type: HostedInputEventType.SubmitFailed;
    payload: {
        error: PaymentErrorData;
    };
}

export interface HostedInputValidateErrorEvent {
    type: HostedInputEventType.ValidateFailed;
    payload: {
        errors: HostedInputValidateErrorData[];
    };
}
