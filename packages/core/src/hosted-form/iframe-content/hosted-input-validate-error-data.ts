import HostedFieldType from '../hosted-field-type';

export default interface HostedInputValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}

export interface HostedInputValidateErrorDataMap {
    [HostedFieldType.CardCode]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardCodeVerification]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardExpiry]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardName]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumber]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumberVerification]?: HostedInputValidateErrorData[];
}
