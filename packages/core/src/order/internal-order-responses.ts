import { InternalResponseBody } from '../common/http-request';
import { InternalCustomer } from '../customer';

import InternalB2BContext from './internal-b2b-context';
import InternalOrder from './internal-order';

export type InternalOrderResponseBody = InternalResponseBody<
    InternalOrderResponseData,
    InternalOrderResponseMeta
>;

export interface InternalOrderResponseData {
    b2bContext?: InternalB2BContext;
    customer: InternalCustomer;
    order: InternalOrder;
}

export interface InternalOrderResponseMeta {
    deviceFingerprint?: string;
}
