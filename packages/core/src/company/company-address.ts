import { RequestOptions } from '../common/http-request';
import { SearchCompanyAddressesQuery } from '../generated-codegen/graphql';

export type CompanyAddressSearchResult = SearchCompanyAddressesQuery;

export type CompanyAddress = NonNullable<
    NonNullable<
        NonNullable<CompanyAddressSearchResult['customer']>['activeCompany']
    >['addresses']['edges']
>[number]['node'];

export interface CompanyAddressSearchOptions extends RequestOptions {
    first?: number;
    isShipping?: boolean;
    isBilling?: boolean;
}
