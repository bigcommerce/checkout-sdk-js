import HostedFieldType from './hosted-field-type';
import { HostedCardFieldOptionsMap, HostedStoredCardFieldOptionsMap } from './hosted-form-options';

export default function isCreditCardFormFields(
    fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
): fields is HostedCardFieldOptionsMap {
    return (
        HostedFieldType.CardNumber in fields &&
        HostedFieldType.CardName in fields &&
        HostedFieldType.CardExpiry in fields
    );
}
