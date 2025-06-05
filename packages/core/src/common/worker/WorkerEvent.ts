export default interface WorkerEvent<TType = string, TPayload = any> {
    type: TType;
    payload?: TPayload;
}

export type WorkerEventMap<TType extends string | number | symbol = string> = {
    [key in TType]: WorkerEvent<TType>;
};

export type WorkerEventListeners<TEventMap, TContext = undefined> = {
    [key in keyof TEventMap]?: Array<(event: TEventMap[key], context?: TContext) => void>;
};
