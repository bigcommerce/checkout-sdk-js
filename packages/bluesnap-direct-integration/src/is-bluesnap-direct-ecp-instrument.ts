import {
    BlueSnapDirectEcpInstrument,
    OrderPaymentRequestBody,
    PaymentArgumentInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

function isBlueSnapDirectEcpInstrument(
    data: OrderPaymentRequestBody['paymentData'],
): data is BlueSnapDirectEcpInstrument {
    if (data === undefined) {
        return false;
    }

    return (
        'accountNumber' in data &&
        'accountType' in data &&
        'shopperPermission' in data &&
        'routingNumber' in data
    );
}

export default function assertBlueSnapDirectEcpInstrument(
    data: OrderPaymentRequestBody['paymentData'],
): asserts data is BlueSnapDirectEcpInstrument {
    if (!isBlueSnapDirectEcpInstrument(data)) {
        throw new PaymentArgumentInvalidError();
    }
}
