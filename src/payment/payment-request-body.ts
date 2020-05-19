import { InternalAddress } from '../address';
import { InternalCart } from '../cart';
import { InternalCustomer } from '../customer';
import { InternalOrder } from '../order';
import { InternalShippingOption } from '../shipping';

import AdditionalAction from './additional-action';
import { PaymentInstrument } from './payment';
import PaymentMethod from './payment-method';

export default interface PaymentRequestBody {
    additionalAction?: AdditionalAction;
    authToken: string;
    billingAddress?: InternalAddress;
    cart?: InternalCart;
    customer?: InternalCustomer;
    order?: InternalOrder;
    orderMeta?: {
        deviceFingerprint?: string;
    };
    payment?: PaymentInstrument;
    paymentMethod?: PaymentMethod;
    quoteMeta?: {
        request?: {
            deviceSessionId?: string;
            geoCountryCode?: string;
            sessionHash?: string;
        };
    };
    shippingAddress?: InternalAddress;
    shippingOption?: InternalShippingOption;
    source?: string;
    store?: {
        storeHash?: string;
        storeId?: string;
        storeLanguage?: string;
        storeName?: string;
    };
}
