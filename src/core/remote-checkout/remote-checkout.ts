import { Address } from '../address';

export default interface RemoteCheckout {
    billingAddress?: Address;
    shippingAddress?: Address;
    isPaymentInitialized?: boolean;
}
