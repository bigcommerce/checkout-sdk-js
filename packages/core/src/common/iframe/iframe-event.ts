export default interface IframeEvent<TType = string, TPayload = any> {
    type: TType;
    payload?: TPayload;
}

export type IframeEventMap<TType extends string | number | symbol = string> = Record<
    TType,
    IframeEvent<TType>
>;
