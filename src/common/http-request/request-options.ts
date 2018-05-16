import { Timeout } from '@bigcommerce/request-sender';

export default interface RequestOptions<TParams = {}> {
    timeout?: Timeout;
    params?: TParams;
}
