import { Response } from '@bigcommerce/request-sender';

export enum HostedInputEventType {
    AttachSucceeded = 'HOSTED_INPUT:ATTACH_SUCCEEDED',
    AttachFailed = 'HOSTED_INPUT:ATTACH_FAILED',
    BinChanged = 'HOSTED_INPUT:BIN_CHANGED',
    Blurred = 'HOSTED_INPUT:BLURRED',
    Changed = 'HOSTED_INPUT:CHANGED',
    CardTypeChanged = 'HOSTED_INPUT:CARD_TYPE_CHANGED',
    Entered = 'HOSTED_INPUT:ENTERED',
    Focused = 'HOSTED_INPUT:FOCUSED',
    SubmitSucceeded = 'HOSTED_INPUT:SUBMIT_SUCCEEDED',
    SubmitFailed = 'HOSTED_INPUT:SUBMIT_FAILED',
    Validated = 'HOSTED_INPUT:VALIDATED',
    ValueRecived = 'HOSTED_INPUT:VALUE_RECIEVED',
}

export interface HostedInputSubmitSuccessEvent {
    type: HostedInputEventType.SubmitSucceeded;
    payload: {
        response: Response<unknown>;
    };
}
