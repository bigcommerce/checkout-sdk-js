export default interface InternalResponseBody<TData = object, TMeta = object> {
    data: TData;
    meta: TMeta;
}
