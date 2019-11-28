import HostedFieldType from '../hosted-field-type';

export default function mapToAccessibilityLabel(type: HostedFieldType): string {
    switch (type) {
    case HostedFieldType.CardCode:
        return 'CVC';

    case HostedFieldType.CardExpiry:
        return 'Expiration';

    case HostedFieldType.CardName:
        return 'Name on card';

    case HostedFieldType.CardNumber:
        return 'Credit card number';
    }
}
