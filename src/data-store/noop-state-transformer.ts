export default function noopStateTransformer<TState, TTransformedState = TState>(
    state: TState
): TTransformedState {
    return state as any as TTransformedState;
}
