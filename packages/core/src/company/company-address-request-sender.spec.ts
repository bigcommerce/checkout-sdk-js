import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';

import { GraphQLRequestSender } from '../common/http-request';
import { SearchCompanyAddressesDocument } from '../generated-codegen/graphql';

import { CompanyAddressSearchResult } from './company-address';
import CompanyAddressRequestSender from './company-address-request-sender';

describe('CompanyAddressRequestSender', () => {
    let graphQLRequestSender: GraphQLRequestSender;
    let companyAddressRequestSender: CompanyAddressRequestSender;

    const result: CompanyAddressSearchResult = { customer: null };

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
                { first: 5, isShipping: true, timeout },
            );

            expect(graphQLRequestSender.query).toHaveBeenCalledWith(
                SearchCompanyAddressesDocument,
                { searchQuery: 'main st', first: 5, isShipping: true, isBilling: undefined },
                { token: 'b2b-token', timeout },
            );
            expect(output).toEqual(result);
        });

        it('forwards the billing filter as a query variable', async () => {
            await companyAddressRequestSender.searchAddresses('b2b-token', 'main st', {
                isBilling: true,
            });

            expect(graphQLRequestSender.query).toHaveBeenCalledWith(
                SearchCompanyAddressesDocument,
                {
                    searchQuery: 'main st',
                    first: undefined,
                    isShipping: undefined,
                    isBilling: true,
                },
                { token: 'b2b-token', timeout: undefined },
            );
        });

        it('omits the search filter when the query is empty', async () => {
            await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(graphQLRequestSender.query).toHaveBeenCalledWith(
                SearchCompanyAddressesDocument,
                {
                    searchQuery: null,
                    first: undefined,
                    isShipping: undefined,
                    isBilling: undefined,
                },
                { token: 'b2b-token', timeout: undefined },
            );
        });
    });
});
