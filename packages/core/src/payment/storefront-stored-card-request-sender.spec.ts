import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    hostedFormStoredCardDataMock,
    hostedFormStoredCardInstrumentFormAPIMock,
    hostedFormStoredCardInstrumentFormMock,
} from '../hosted-form/hosted-form-stored-card.mock';

import StorefrontStoredCardRequestSender from './storefront-stored-card-request-sender';

describe('StorefrontStoredCardRequestSender', () => {
    let requestSender: RequestSender;
    let storefrontStoredCardRequestSender: StorefrontStoredCardRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        storefrontStoredCardRequestSender = new StorefrontStoredCardRequestSender(requestSender);

        jest.spyOn(requestSender, 'post').mockResolvedValue(undefined);
    });

    describe('#submitPaymentMethod', () => {
        const headers = {
            Authorization: hostedFormStoredCardDataMock.vaultToken,
            Accept: 'application/vnd.bc.v1+json',
            'Content-Type': 'application/vnd.bc.v1+json',
        };

        it('saves payment method', async () => {
            await storefrontStoredCardRequestSender.submitPaymentInstrument(
                hostedFormStoredCardDataMock,
                hostedFormStoredCardInstrumentFormMock,
            );

            const { instrument, billingAddress } = hostedFormStoredCardInstrumentFormAPIMock;

            expect(requestSender.post).toHaveBeenCalledWith(
                `${hostedFormStoredCardDataMock.paymentsUrl}/stores/${hostedFormStoredCardDataMock.storeHash}/customers/${hostedFormStoredCardDataMock.shopperId}/stored_instruments`,
                {
                    body: JSON.stringify({
                        instrument,
                        billing_address: billingAddress,
                        provider_id: hostedFormStoredCardDataMock.providerId,
                        default_instrument:
                            hostedFormStoredCardInstrumentFormAPIMock.default_Instrument,
                        currency_code: hostedFormStoredCardDataMock.currencyCode,
                    }),
                    headers,
                },
            );
        });
    });
});
