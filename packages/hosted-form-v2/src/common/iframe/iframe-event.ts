export default interface IframeEvent<TType = string, TPayload = any> {
    type: TType;
    payload?: TPayload;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type IframeEventMap<TType extends string | number | symbol = string> = {
    [key in TType]: IframeEvent<TType>;
};
