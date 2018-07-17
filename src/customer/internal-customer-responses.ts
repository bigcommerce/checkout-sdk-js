import { InternalResponseBody } from '../common/http-request';

import InternalCustomer from './internal-customer';

export type InternalCustomerResponseBody = InternalResponseBody<InternalCustomerResponseData>;

export interface InternalCustomerResponseData {
    customer: InternalCustomer;
}
