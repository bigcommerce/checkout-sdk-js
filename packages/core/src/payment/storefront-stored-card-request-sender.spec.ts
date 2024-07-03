import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    StoredCardHostedFormDataMock,
    StoredCardHostedFormInstrumentFormAPIMock,
    StoredCardHostedFormInstrumentFormMock,
} from '../hosted-form/stored-card-hosted-form.mock';

import StorefrontStoredCardRequestSender from './storefront-stored-card-request-sender';

describe('StorefrontStoredCardRequestSender', () => {
    let requestSender: RequestSender;
    let storefrontStoredCardRequestSender: StorefrontStoredCardRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        storefrontStoredCardRequestSender = new StorefrontStoredCardRequestSender(requestSender);

        jest.spyOn(requestSender, 'post').mockResolvedValue(getResponse({}));
    });

    describe('#submitPaymentMethod', () => {
        const headers = {
            Authorization: StoredCardHostedFormDataMock.vaultToken,
            Accept: 'application/vnd.bc.v1+json',
            'Content-Type': 'application/vnd.bc.v1+json',
        };

        it('saves payment method', async () => {
            await storefrontStoredCardRequestSender.submitPaymentInstrument(
                StoredCardHostedFormDataMock,
                StoredCardHostedFormInstrumentFormMock,
            );

            const { instrument, billingAddress } = StoredCardHostedFormInstrumentFormAPIMock;

            expect(requestSender.post).toHaveBeenCalledWith(
                `${StoredCardHostedFormDataMock.paymentsUrl}/stores/${StoredCardHostedFormDataMock.storeHash}/customers/${StoredCardHostedFormDataMock.shopperId}/stored_instruments`,
                {
                    body: JSON.stringify({
                        instrument,
                        billing_address: billingAddress,
                        provider_id: StoredCardHostedFormDataMock.providerId,
                        default_instrument:
                            StoredCardHostedFormInstrumentFormAPIMock.default_Instrument,
                        currency_code: StoredCardHostedFormDataMock.currencyCode,
                    }),
                    headers,
                },
            );
        });
    });
});
