import { InternalAddress } from '../address';

export default interface RemoteCheckout {
    billingAddress?: InternalAddress | false;
    shippingAddress?: InternalAddress | false;
}
