import HostedFieldType from '../hosted-field-type';

export default function mapToAutocompleteType(type: HostedFieldType): string {
    switch (type) {
    case HostedFieldType.CardCode:
        return 'cc-csc';

    case HostedFieldType.CardExpiry:
        return 'cc-exp';

    case HostedFieldType.CardName:
        return 'cc-name';

    case HostedFieldType.CardNumber:
        return 'cc-number';

    default:
        return '';
    }
}
