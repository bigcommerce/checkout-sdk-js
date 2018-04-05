import { InternalAddress } from '../address';

export default interface RemoteCheckout {
    billingAddress?: InternalAddress;
    shippingAddress?: InternalAddress;
}
