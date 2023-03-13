import HostedFieldType from './hosted-field-type';
import { HostedCardFieldOptionsMap, HostedStoredCardFieldOptionsMap } from './hosted-form-options';

export default function isStoredCreditCardFormFields(
    fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
): fields is HostedStoredCardFieldOptionsMap {
    return (
        !(HostedFieldType.CardNumber in fields) &&
        !(HostedFieldType.CardName in fields) &&
        !(HostedFieldType.CardCode in fields) &&
        !(HostedFieldType.CardExpiry in fields)
    );
}
