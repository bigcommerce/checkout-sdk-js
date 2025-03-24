import GQLCartResponse from './gql-cart';

export interface GQLCartRequestResponse {
    data: {
        site: GQLCartResponse;
    };
}
