/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query SearchCompanyAddresses($searchQuery: String, $first: Int = 10) {\n  company {\n    addresses(\n      first: $first\n      filters: {searchQuery: $searchQuery}\n      sort: [{field: CREATED_AT, direction: DESC}]\n    ) {\n      edges {\n        node {\n          entityId\n          firstName\n          lastName\n          address1\n          address2\n          city\n          stateOrProvince\n          stateOrProvinceCode\n          postalCode\n          country\n          countryCode\n          phone\n          label\n          isDefaultShipping\n          isDefaultBilling\n          isShipping\n          isBilling\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}": typeof types.SearchCompanyAddressesDocument,
};
const documents: Documents = {
    "query SearchCompanyAddresses($searchQuery: String, $first: Int = 10) {\n  company {\n    addresses(\n      first: $first\n      filters: {searchQuery: $searchQuery}\n      sort: [{field: CREATED_AT, direction: DESC}]\n    ) {\n      edges {\n        node {\n          entityId\n          firstName\n          lastName\n          address1\n          address2\n          city\n          stateOrProvince\n          stateOrProvinceCode\n          postalCode\n          country\n          countryCode\n          phone\n          label\n          isDefaultShipping\n          isDefaultBilling\n          isShipping\n          isBilling\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}": types.SearchCompanyAddressesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SearchCompanyAddresses($searchQuery: String, $first: Int = 10) {\n  company {\n    addresses(\n      first: $first\n      filters: {searchQuery: $searchQuery}\n      sort: [{field: CREATED_AT, direction: DESC}]\n    ) {\n      edges {\n        node {\n          entityId\n          firstName\n          lastName\n          address1\n          address2\n          city\n          stateOrProvince\n          stateOrProvinceCode\n          postalCode\n          country\n          countryCode\n          phone\n          label\n          isDefaultShipping\n          isDefaultBilling\n          isShipping\n          isBilling\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}"): typeof import('./graphql').SearchCompanyAddressesDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
