import { assign } from 'lodash';

export default function transformParams<TParams extends { include?: string[] | string }>(
    params?: TParams
): TParams | TParams & { include: string } | undefined {
    if (!params || !Array.isArray(params.include)) {
        return params;
    }

    return assign({}, params, { include: params.include.join(',') });
}
