import { CustomerAddress } from '../customer';
import { CardInstrument } from '../payment';

export type PaymentProviderCustomer =
    | BraintreeAcceleratedCheckoutCustomer
    | StripeAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}

export interface StripeAcceleratedCheckoutCustomer {
    authenticationState?: boolean;
}
