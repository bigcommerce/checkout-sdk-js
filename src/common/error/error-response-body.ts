export default interface ErrorResponseBody {
    type?: string;
    errors?: Array<{ code: string }>;
}
