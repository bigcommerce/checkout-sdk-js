import { SearchCompanyAddressesDocument } from '../__generated__/graphql';
import { GraphQLRequestSender } from '../common/http-request';

import { CompanyAddressSearchOptions, CompanyAddressSearchResult } from './company-address';

export default class CompanyAddressRequestSender {
    constructor(private _graphQLRequestSender: GraphQLRequestSender) {}

    searchAddresses(
        token: string,
        searchQuery: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<CompanyAddressSearchResult> {
        const { first, timeout } = options || {};

        return this._graphQLRequestSender.query(
            SearchCompanyAddressesDocument,
            {
                searchQuery: searchQuery || null,
                first,
            },
            { token, timeout },
        );
    }
}
