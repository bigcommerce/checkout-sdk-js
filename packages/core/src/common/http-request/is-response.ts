import { Response } from '@bigcommerce/request-sender';

export default function isResponse<TBody>(value: unknown): value is Response<TBody | undefined> {
    return typeof value === 'object' && value !== null && 'status' in value && 'body' in value;
}
