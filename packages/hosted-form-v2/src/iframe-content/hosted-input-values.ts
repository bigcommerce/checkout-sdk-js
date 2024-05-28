import HostedFieldType from '../hosted-field-type';

export default interface HostedInputValues {
    [HostedFieldType.CardCode]?: string;
    [HostedFieldType.CardCodeVerification]?: string;
    [HostedFieldType.CardExpiry]?: string;
    [HostedFieldType.CardName]?: string;
    [HostedFieldType.CardNumber]?: string;
    [HostedFieldType.CardNumberVerification]?: string;
}
