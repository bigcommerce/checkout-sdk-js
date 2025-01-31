export type ExtensionQuery = GetConsignmentsQuery;

export enum ExtensionQueryType {
    GetConsignments = 'EXTENSION:GET_CONSIGNMENTS',
}

export interface GetConsignmentsQuery {
    type: ExtensionQueryType.GetConsignments;
    payload?: {
        useCache?: boolean;
    };
}

export interface ExtensionQueryMap {
    [ExtensionQueryType.GetConsignments]: GetConsignmentsQuery;
}
