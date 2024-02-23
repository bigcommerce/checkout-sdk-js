import HostedFieldType from './hosted-field-type';
import { HostedCardFieldOptionsMap, HostedStoredCardFieldOptionsMap } from './hosted-form-options';

export default function isCreditCardVaultedFormFields(
    fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
): fields is HostedStoredCardFieldOptionsMap {
    return (
        HostedFieldType.CardNumberVerification in fields &&
        HostedFieldType.CardCodeVerification in fields &&
        HostedFieldType.CardExpiryVerification in fields
    );
}
