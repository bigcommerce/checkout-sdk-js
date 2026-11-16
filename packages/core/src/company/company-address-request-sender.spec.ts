import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';

import { GraphQLRequestSender } from '../common/http-request';
import { SearchCompanyAddressesDocument } from '../generated-codegen/graphql';

import { CompanyAddress, CompanyAddressSearchResult } from './company-address';
import CompanyAddressRequestSender from './company-address-request-sender';

describe('CompanyAddressRequestSender', () => {
    let graphQLRequestSender: GraphQLRequestSender;
    let companyAddressRequestSender: CompanyAddressRequestSender;

    const result: CompanyAddressSearchResult = { customer: null };

    const createCompanyAddress = (overrides: Partial<CompanyAddress> = {}): CompanyAddress => ({
        entityId: 1,
        firstName: 'Test',
        lastName: 'Tester',
        address1: '12345 Testing Way',
        city: 'Some City',
        country: 'United States',
        countryCode: 'US',
        label: 'Headquarters',
        company: 'Address Company',
        extraFields: [
            {
                __typename: 'TextExtraFieldValue',
                name: 'Cost Center',
                fieldEntityId: 100,
                text: '5000',
            },
        ],
        ...overrides,
    });

    const createSearchResult = (
        addresses: CompanyAddress[],
        companyName: string | null = 'Active Company',
    ): CompanyAddressSearchResult => ({
        customer: {
            activeCompany: {
                companyName,
                addresses: {
                    edges: addresses.map((node) => ({ node })),
                    pageInfo: { hasNextPage: true, endCursor: 'cursor' },
                },
            },
        },
    });

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

        it('keeps the company name saved on the address', async () => {
            const searchResult = createSearchResult([createCompanyAddress()]);

            jest.spyOn(graphQLRequestSender, 'query').mockResolvedValue(searchResult);

            const output = await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(output).toEqual(searchResult);
        });

        it('falls back to the active company name when the address has no company name', async () => {
            const addressWithoutCompany = createCompanyAddress({ entityId: 2, company: null });
            const addressWithEmptyCompany = createCompanyAddress({ entityId: 3, company: '' });

            jest.spyOn(graphQLRequestSender, 'query').mockResolvedValue(
                createSearchResult([
                    createCompanyAddress(),
                    addressWithoutCompany,
                    addressWithEmptyCompany,
                ]),
            );

            const output = await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(output).toEqual(
                createSearchResult([
                    createCompanyAddress(),
                    { ...addressWithoutCompany, company: 'Active Company' },
                    { ...addressWithEmptyCompany, company: 'Active Company' },
                ]),
            );
        });

        it('returns the result unchanged when the active company has no name', async () => {
            const searchResult = createSearchResult(
                [createCompanyAddress({ company: null })],
                null,
            );

            jest.spyOn(graphQLRequestSender, 'query').mockResolvedValue(searchResult);

            const output = await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(output).toBe(searchResult);
        });

        it('returns the result unchanged when there is no active company', async () => {
            const searchResult: CompanyAddressSearchResult = {
                customer: { activeCompany: null },
            };

            jest.spyOn(graphQLRequestSender, 'query').mockResolvedValue(searchResult);

            const output = await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(output).toBe(searchResult);
        });

        it('keeps edges unset when the connection has no edges', async () => {
            const searchResult: CompanyAddressSearchResult = {
                customer: {
                    activeCompany: {
                        companyName: 'Active Company',
                        addresses: { edges: null, pageInfo: { hasNextPage: false } },
                    },
                },
            };

            jest.spyOn(graphQLRequestSender, 'query').mockResolvedValue(searchResult);

            const output = await companyAddressRequestSender.searchAddresses('b2b-token', '');

            expect(output.customer?.activeCompany?.addresses.edges).toBeUndefined();
        });
    });
});
