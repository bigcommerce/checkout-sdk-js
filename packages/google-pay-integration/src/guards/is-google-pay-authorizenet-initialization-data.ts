import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayAuthorizeNetInitializationData, GooglePayInitializationData } from '../types';

function isGooglePayAuthorizeNetInitializationData(
    data: GooglePayInitializationData,
): data is GooglePayAuthorizeNetInitializationData {
    return 'paymentGatewayId' in data;
}

export default function assertsIsGooglePayAuthorizeNetInitializationData(
    data: GooglePayInitializationData,
): asserts data is GooglePayAuthorizeNetInitializationData {
    if (!isGooglePayAuthorizeNetInitializationData(data)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
    }
}
