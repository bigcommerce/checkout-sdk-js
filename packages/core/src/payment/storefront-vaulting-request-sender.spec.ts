import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    hostedFormVaultingDataMock,
    hostedFormVaultingInstrumentFormAPIMock,
    hostedFormVaultingInstrumentFormMock,
} from '../hosted-form/hosted-form-vaulting.mock';

import StorefrontVaultingRequestSender from './storefront-vaulting-request-sender';

describe('StorefrontVaultingRequestSender', () => {
    let requestSender: RequestSender;
    let storefrontVaultingRequestSender: StorefrontVaultingRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        storefrontVaultingRequestSender = new StorefrontVaultingRequestSender(requestSender);

        jest.spyOn(requestSender, 'post').mockResolvedValue(undefined);
    });

    describe('#submitPaymentMethod', () => {
        const headers = {
            Authorization: hostedFormVaultingDataMock.vaultToken,
            Accept: 'application/vnd.bc.v1+json',
            'Content-Type': 'application/vnd.bc.v1+json',
        };

        it('saves payment method', async () => {
            await storefrontVaultingRequestSender.submitPaymentInstrument(
                hostedFormVaultingDataMock,
                hostedFormVaultingInstrumentFormMock,
            );

            const { instrument, billingAddress } = hostedFormVaultingInstrumentFormAPIMock;

            expect(requestSender.post).toHaveBeenCalledWith(
                `${hostedFormVaultingDataMock.paymentsUrl}/stores/${hostedFormVaultingDataMock.storeHash}/customers/${hostedFormVaultingDataMock.shopperId}/stored_instruments`,
                {
                    body: JSON.stringify({
                        instrument,
                        billing_address: billingAddress,
                        provider_id: hostedFormVaultingDataMock.providerId,
                        default_instrument:
                            hostedFormVaultingInstrumentFormAPIMock.default_Instrument,
                        currency_code: hostedFormVaultingDataMock.currencyCode,
                    }),
                    headers,
                },
            );
        });
    });
});
