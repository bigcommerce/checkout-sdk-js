import { Response } from '@bigcommerce/request-sender';

import {
    BillingAddress,
    BillingAddressUpdateRequestBody,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import HeadlessWalletButtonIntegrationRequestService from './headless-wallet-button-integration-request-service';
import HeadlessWalletButtonIntegrationService from './headless-wallet-button-integration-service';

export default class DefaultHeadlessWalletButtonIntegrationService
    implements HeadlessWalletButtonIntegrationService
{
    constructor(
        private headlessWalletButtonIntegrationRequestService: HeadlessWalletButtonIntegrationRequestService,
    ) {}

    async updateBillingAddress(
        checkoutId: string,
        address: BillingAddressUpdateRequestBody,
        options?: RequestOptions,
    ): Promise<Response<BillingAddress>> {
        return this.headlessWalletButtonIntegrationRequestService.updateBillingAddress(
            checkoutId,
            address,
            options,
        );
    }
}
