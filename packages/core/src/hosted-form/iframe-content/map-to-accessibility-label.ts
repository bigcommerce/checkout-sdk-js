import { HostedFieldType } from '@bigcommerce/checkout-sdk/payment-integration-api';

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
