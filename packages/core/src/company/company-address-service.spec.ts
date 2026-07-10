import { createRequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';

import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { GraphQLRequestSender } from '../common/http-request';

import B2BStorefrontTokenRequestSender from './b2b-storefront-token-request-sender';
import { CompanyAddressSearchResult } from './company-address';
import CompanyAddressRequestSender from './company-address-request-sender';
import CompanyAddressService from './company-address-service';

describe('CompanyAddressService', () => {
    let storefrontTokenRequestSender: B2BStorefrontTokenRequestSender;
    let requestSender: CompanyAddressRequestSender;

    const result: CompanyAddressSearchResult = { company: null };

    const createService = (store: ReadableCheckoutStore) => {
        storefrontTokenRequestSender = new B2BStorefrontTokenRequestSender(createRequestSender());
        requestSender = new CompanyAddressRequestSender(
            new GraphQLRequestSender(createRequestSender()),
        );

        jest.spyOn(storefrontTokenRequestSender, 'createStorefrontToken').mockResolvedValue(
            'storefront-token',
        );
        jest.spyOn(requestSender, 'searchAddresses').mockResolvedValue(result);

        return new CompanyAddressService(store, storefrontTokenRequestSender, requestSender);
    };

    describe('#searchAddresses()', () => {
        it('exchanges the stored B2B token and searches with the storefront token', async () => {
            const store = createCheckoutStore(
                merge(getCheckoutStoreState(), { b2bToken: { data: { token: 'b2b-token' } } }),
            );
            const service = createService(store);

            const output = await service.searchAddresses('main st', { first: 5 });

            expect(storefrontTokenRequestSender.createStorefrontToken).toHaveBeenCalledWith(
                'b2b-token',
                expect.any(String),
                expect.objectContaining({
                    storeHash: expect.any(String),
                    channelId: expect.any(Number),
                    expiresAt: expect.any(Number),
                    allowedCorsOrigins: [window.location.origin],
                }),
                { first: 5 },
            );
            expect(requestSender.searchAddresses).toHaveBeenCalledWith(
                'storefront-token',
                'main st',
                { first: 5 },
            );
            expect(output).toEqual(result);
        });

        it('rejects with MissingDataError when no B2B token is loaded', async () => {
            const service = createService(createCheckoutStore(getCheckoutStoreState()));

            await expect(service.searchAddresses('main st')).rejects.toThrow(MissingDataError);
            expect(storefrontTokenRequestSender.createStorefrontToken).not.toHaveBeenCalled();
            expect(requestSender.searchAddresses).not.toHaveBeenCalled();
        });
    });
});
