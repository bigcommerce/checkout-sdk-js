import { SearchCompanyAddressesDocument } from '../generated-codegen/graphql';
import { GraphQLRequestSender } from '../common/http-request';

import { CompanyAddressSearchOptions, CompanyAddressSearchResult } from './company-address';

export default class CompanyAddressRequestSender {
    constructor(private _graphQLRequestSender: GraphQLRequestSender) {}

    searchAddresses(
        token: string,
        searchQuery: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<CompanyAddressSearchResult> {
        const { first, isShipping, isBilling, timeout } = options || {};

        return this._graphQLRequestSender.query(
            SearchCompanyAddressesDocument,
            {
                searchQuery: searchQuery || null,
                first,
                isShipping,
                isBilling,
            },
            { token, timeout },
        );
    }
}
