import { omitBy } from 'lodash';
import Action from './action';

export default function createAction<TPayload, TMeta>(
    type: string,
    payload?: TPayload,
    meta?: TMeta
): Action<TPayload, TMeta> {
    if (typeof type !== 'string' || type === '') {
        throw new Error('`type` must be a string');
    }

    return { type, ...omitBy({ payload, meta }, value => value === undefined) };
}
