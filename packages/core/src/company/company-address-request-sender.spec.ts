import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';

import { SearchCompanyAddressesDocument } from '../__generated__/graphql';
import { GraphQLRequestSender } from '../common/http-request';

import { CompanyAddressSearchResult } from './company-address';
import CompanyAddressRequestSender from './company-address-request-sender';

describe('CompanyAddressRequestSender', () => {
    let graphQLRequestSender: GraphQLRequestSender;
    let companyAddressRequestSender: CompanyAddressRequestSender;

    const result: CompanyAddressSearchResult = { company: null };

    beforeEach(() => {
        graphQLRequestSender = new GraphQLRequestSender(createRequestSender());

        jest.spyOn(graphQLRequestSender, 'query').mockResolvedValue(result);

        companyAddressRequestSender = new CompanyAddressRequestSender(graphQLRequestSender);
    });

    describe('#searchAddresses()', () => {
        it('queries the search document with the given variables and token', async () => {
            const timeout = createTimeout();

            const output = await companyAddressRequestSender.searchAddresses(
                'b2b-token',
                'main st',
                { first: 5, timeout },
            );

            expect(graphQLRequestSender.query).toHaveBeenCalledWith(
                SearchCompanyAddressesDocument,
                { searchQuery: 'main st', first: 5 },
                { token: 'b2b-token', timeout },
            );
            expect(output).toEqual(result);
        });

        it('omits the search filter when the query is empty', async () => {
            await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(graphQLRequestSender.query).toHaveBeenCalledWith(
                SearchCompanyAddressesDocument,
                { searchQuery: null, first: undefined },
                { token: 'b2b-token', timeout: undefined },
            );
        });
    });
});
