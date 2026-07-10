import { RequestOptions } from '../common/http-request';
import { SearchCompanyAddressesQuery } from '../generated_codegen/graphql';

export type CompanyAddressSearchResult = SearchCompanyAddressesQuery;

export type CompanyAddress = NonNullable<
    NonNullable<CompanyAddressSearchResult['company']>['addresses']['edges']
>[number]['node'];

export interface CompanyAddressSearchOptions extends RequestOptions {
    first?: number;
}
