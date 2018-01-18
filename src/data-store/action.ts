export default interface Action<TPayload = any, TMeta = any> {
    type: string;
    error?: boolean;
    meta?: TMeta;
    payload?: TPayload;
}
