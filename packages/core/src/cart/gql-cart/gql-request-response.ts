export interface GQLRequestResponse<T> {
    data: {
        site: T;
    };
}
