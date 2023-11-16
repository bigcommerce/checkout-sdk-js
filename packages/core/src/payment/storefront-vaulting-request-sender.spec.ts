import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    hostedFormVaultingDataMock,
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
            await storefrontVaultingRequestSender.submitPaymentMethod(
                hostedFormVaultingDataMock,
                hostedFormVaultingInstrumentFormMock,
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                `${hostedFormVaultingDataMock.paymentsUrl}/stores/${hostedFormVaultingDataMock.storeHash}/customers/${hostedFormVaultingDataMock.shopperId}/stored_instruments`,
                {
                    body: JSON.stringify({
                        instrument: hostedFormVaultingInstrumentFormMock.instrument,
                        billing_address: hostedFormVaultingInstrumentFormMock.billingAddress,
                        provider_id: hostedFormVaultingDataMock.providerId,
                        default_instrument: hostedFormVaultingInstrumentFormMock.default_instrument,
                        currency_code: hostedFormVaultingDataMock.currencyCode,
                    }),
                    headers,
                },
            );
        });
    });
});
