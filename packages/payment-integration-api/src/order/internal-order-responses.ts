import { InternalCustomer } from '../customer';

import InternalOrder from './internal-order';

export interface InternalOrderResponseData {
    customer: InternalCustomer;
    order: InternalOrder;
}

export interface InternalOrderResponseMeta {
    deviceFingerprint?: string;
}
