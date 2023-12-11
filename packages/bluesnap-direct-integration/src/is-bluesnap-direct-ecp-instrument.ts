import {
    EcpInstrument,
    PaymentArgumentInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

function isEcpInstrument(data: unknown): data is EcpInstrument {
    return Boolean(
        typeof data === 'object' &&
            data !== null &&
            'accountNumber' in data &&
            'accountType' in data &&
            'shopperPermission' in data &&
            'routingNumber' in data,
    );
}

export default function assertEcpInstrument(data: unknown): asserts data is EcpInstrument {
    if (!isEcpInstrument(data)) {
        throw new PaymentArgumentInvalidError();
    }
}
