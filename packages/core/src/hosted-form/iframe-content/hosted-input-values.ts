import { HostedFieldType } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface HostedInputValues {
    [HostedFieldType.CardCode]?: string;
    [HostedFieldType.CardCodeVerification]?: string;
    [HostedFieldType.CardExpiry]?: string;
    [HostedFieldType.CardName]?: string;
    [HostedFieldType.CardNumber]?: string;
    [HostedFieldType.CardNumberVerification]?: string;
}
