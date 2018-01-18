import Action from './action';
import createAction from './create-action';

export default function createErrorAction<TPayload, TMeta>(
    type: string,
    payload?: TPayload,
    meta?: TMeta
): Action<TPayload, TMeta> {
    return {
        ...createAction(type, payload, meta),
        error: true,
    };
}
