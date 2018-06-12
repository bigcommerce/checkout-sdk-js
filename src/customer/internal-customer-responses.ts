import { InternalCart } from '../cart';
import { InternalResponseBody } from '../common/http-request';
import { InternalQuote } from '../quote';
import { InternalShippingOptionList } from '../shipping';

import InternalCustomer from './internal-customer';

export type InternalCustomerResponseBody = InternalResponseBody<InternalCustomerResponseData>;

export interface InternalCustomerResponseData {
    cart: InternalCart;
    customer: InternalCustomer;
    quote: InternalQuote;
    shippingOptions: InternalShippingOptionList;
}
