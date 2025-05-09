import { Response } from '@bigcommerce/request-sender';

import {
    BillingAddress,
    BillingAddressUpdateRequestBody,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface HeadlessWalletButtonIntegrationService {
    updateBillingAddress(
        checkoutId: string,
        address: Partial<BillingAddressUpdateRequestBody>,
        options?: RequestOptions,
    ): Promise<Response<BillingAddress>>;
}
