import { CardInstrument } from '../payment';
import { AddressRequestBody } from '../address';

export type PaymentProviderCustomer = PayPalConnectCheckoutCustomer;

// export interface BraintreeAcceleratedCheckoutCustomer {
//     authenticationState?: string;
//     addresses?: CustomerAddress[]; // Why do we need CustomerAddress here?
//     instruments?: CardInstrument[];
// }

// Used for BraintreeAcceleratedCheckout and PayPalCommerceAcceleratedCheckout
export interface PayPalConnectCheckoutCustomer {
    authenticationState?: string;
    addresses?: AddressRequestBody[];
    instruments?: CardInstrument[];
}
