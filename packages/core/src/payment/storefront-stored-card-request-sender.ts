import { RequestSender } from '@bigcommerce/request-sender';

import {
    StoredCardHostedFormData,
    StoredCardHostedFormInstrumentForm,
} from '../hosted-form/stored-card-hosted-form-type';

export default class StorefrontStoredCardRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async submitPaymentInstrument(
        requestInitializationData: StoredCardHostedFormData,
        storeInstrumentFormData: StoredCardHostedFormInstrumentForm,
    ): Promise<void> {
        const { providerId, currencyCode, paymentsUrl, shopperId, storeHash, vaultToken } =
            requestInitializationData;

        const { billingAddress, instrument, defaultInstrument } = storeInstrumentFormData;
        const url = `${paymentsUrl}/stores/${storeHash}/customers/${shopperId}/stored_instruments`;
        const options = {
            headers: {
                Authorization: vaultToken,
                Accept: 'application/vnd.bc.v1+json',
                'Content-Type': 'application/vnd.bc.v1+json',
            },
            body: JSON.stringify({
                instrument: {
                    type: instrument.type,
                    cardholder_name: instrument.cardholderName,
                    number: instrument.number,
                    expiry_month: instrument.expiryMonth,
                    expiry_year: instrument.expiryYear,
                    verification_value: instrument.verificationValue,
                },
                billing_address: {
                    email: billingAddress.email,
                    address1: billingAddress.address1,
                    ...(billingAddress.address2 && { address2: billingAddress.address2 }),
                    city: billingAddress.city,
                    postal_code: billingAddress.postalCode,
                    country_code: billingAddress.countryCode,
                    ...(billingAddress.company && { company: billingAddress.company }),
                    first_name: billingAddress.firstName,
                    last_name: billingAddress.lastName,
                    ...(billingAddress.phone && { phone: billingAddress.phone }),
                    ...(billingAddress.stateOrProvinceCode && {
                        state_or_province_code: billingAddress.stateOrProvinceCode,
                    }),
                },
                provider_id: providerId,
                default_instrument: defaultInstrument,
                currency_code: currencyCode,
            }),
        };

        await this._requestSender.post<void>(url, options);
    }
}
