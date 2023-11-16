import { RequestSender } from '@bigcommerce/request-sender';

import {
    HostedFormVaultingData,
    HostedFormVaultingInstrumentForm,
} from '../hosted-form/hosted-form-vaulting';

export default class StorefrontVaultingRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async submitPaymentMethod(
        requestInitializationData: HostedFormVaultingData,
        storeInstrumentFormData: HostedFormVaultingInstrumentForm,
    ): Promise<void> {
        const { providerId, currencyCode, paymentsUrl, shopperId, storeHash, vaultToken } =
            requestInitializationData;

        const { billingAddress, instrument, default_instrument } = storeInstrumentFormData;
        const url = `${paymentsUrl}/stores/${storeHash}/customers/${shopperId}/stored_instruments`;
        const options = {
            headers: {
                Authorization: vaultToken,
                Accept: 'application/vnd.bc.v1+json',
                'Content-Type': 'application/vnd.bc.v1+json',
            },
            body: JSON.stringify({
                instrument,
                billing_address: billingAddress,
                provider_id: providerId,
                default_instrument,
                currency_code: currencyCode,
            }),
        };

        await this._requestSender.post<void>(url, options);
    }
}
