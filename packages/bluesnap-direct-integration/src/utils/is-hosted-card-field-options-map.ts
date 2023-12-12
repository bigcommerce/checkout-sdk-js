import {
    HostedCardFieldOptionsMap,
    HostedFieldOptionsMap,
    HostedFieldType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isHostedCardFieldOptionsMap(
    fields: HostedFieldOptionsMap,
): fields is HostedCardFieldOptionsMap {
    return HostedFieldType.CardNumber in fields;
}
