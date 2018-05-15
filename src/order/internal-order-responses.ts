import { InternalResponseBody } from '../common/http-request';
import { InternalCustomer } from '../customer';

import InternalOrder from './internal-order';

export type InternalOrderResponseBody = InternalResponseBody<InternalOrderResponseData, InternalOrderResponseMeta>;

export interface InternalOrderResponseData {
    customer: InternalCustomer;
    order: InternalOrder;
}

export interface InternalOrderResponseMeta {
    deviceFingerprint?: string;
}
