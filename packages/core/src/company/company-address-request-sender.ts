import { GraphQLRequestSender } from '../common/http-request';
import {
    SearchCompanyAddressesDocument,
    SearchCompanyAddressesQuery,
} from '../generated-codegen/graphql';

import { CompanyAddressSearchOptions, CompanyAddressSearchResult } from './company-address';

export default class CompanyAddressRequestSender {
    constructor(private _graphQLRequestSender: GraphQLRequestSender) {}

    searchAddresses(
        token: string,
        searchQuery: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<CompanyAddressSearchResult> {
        const { first, isShipping, isBilling, timeout } = options || {};

        return this._graphQLRequestSender
            .query(
                SearchCompanyAddressesDocument,
                {
                    searchQuery: searchQuery || null,
                    first,
                    isShipping,
                    isBilling,
                },
                { token, timeout },
            )
            .then((result) => this._applyActiveCompanyNameFallback(result));
    }

    private _applyActiveCompanyNameFallback(
        result: SearchCompanyAddressesQuery,
    ): CompanyAddressSearchResult {
        const activeCompany = result.customer?.activeCompany;

        if (!activeCompany?.companyName) {
            return result;
        }

        const { addresses, companyName } = activeCompany;

        return {
            customer: {
                activeCompany: {
                    ...activeCompany,
                    addresses: {
                        ...addresses,
                        edges: addresses.edges?.map(({ node }) => ({
                            node: { ...node, company: node.company || companyName },
                        })),
                    },
                },
            },
        };
    }
}
