import { SearchCompanyAddressesQuery } from '../__generated__/graphql';
import { RequestOptions } from '../common/http-request';

/**
 * The raw payload returned by the storefront GraphQL `SearchCompanyAddresses`
 * query. `company` is `null` when the shopper is not signed in or the store
 * does not have B2B enabled.
 */
export type CompanyAddressSearchResult = SearchCompanyAddressesQuery;

/**
 * A single company address node within a `CompanyAddressSearchResult`.
 */
export type CompanyAddress = NonNullable<
    NonNullable<CompanyAddressSearchResult['company']>['addresses']['edges']
>[number]['node'];

export interface CompanyAddressSearchOptions extends RequestOptions {
    /**
     * The maximum number of addresses to return. Defaults to 10.
     */
    first?: number;
}
