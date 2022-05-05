import HostedFieldType from '../hosted-field-type';

export default function mapToAccessibilityLabel(type: HostedFieldType): string {
    switch (type) {
    case HostedFieldType.CardCode:
    case HostedFieldType.CardCodeVerification:
        return 'CVC';

    case HostedFieldType.CardExpiry:
        return 'Expiration';

    case HostedFieldType.CardName:
        return 'Name on card';

    case HostedFieldType.CardNumber:
    case HostedFieldType.CardNumberVerification:
        return 'Credit card number';
    }
}
