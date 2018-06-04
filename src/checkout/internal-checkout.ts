import { InternalCart } from '../cart';
import { InternalCustomer } from '../customer';
import { InternalQuote } from '../quote';
import { InternalShippingOptionList } from '../shipping';

export default interface InternalCheckout {
    data: {
        cart?: InternalCart;
        customer?: InternalCustomer;
        quote?: InternalQuote;
        shippingOptions?: InternalShippingOptionList;
    };
}
