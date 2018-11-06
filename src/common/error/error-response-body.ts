export default interface ErrorResponseBody {
    title?: string;
    // todo: create different error response bodies, payment error responses use string
    status?: number | string;
    type?: string;
    detail?: string;
    errors?: ErrorListResponseBody;
}

// todo: create different errorLists, payments use objects, order use strings
export type ErrorListResponseBody =
    Array<{ code: string; message?: string; } | null | string>;
