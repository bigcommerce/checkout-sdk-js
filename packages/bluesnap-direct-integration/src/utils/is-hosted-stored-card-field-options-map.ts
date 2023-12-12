import {
    HostedFieldOptionsMap,
    HostedFieldType,
    HostedStoredCardFieldOptionsMap,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isHostedStoredCardFieldOptionsMap(
    fields: HostedFieldOptionsMap,
): fields is HostedStoredCardFieldOptionsMap {
    return (
        HostedFieldType.CardCodeVerification in fields ||
        HostedFieldType.CardNumberVerification in fields
    );
}
