export default interface InternalResponseBody<TData = {}, TMeta = {}> {
    data: TData;
    meta: TMeta;
}
