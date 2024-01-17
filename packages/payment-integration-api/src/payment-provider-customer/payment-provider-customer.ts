import { AddressRequestBody } from '../address';
import { CustomerAddress } from '../customer';
import { CardInstrument } from '../payment';

export type PaymentProviderCustomer =
    | BraintreeAcceleratedCheckoutCustomer
    | PayPalCommerceAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}

export interface PayPalCommerceAcceleratedCheckoutCustomer {
    authenticationState?: string;
    addresses?: AddressRequestBody[];
    instruments?: CardInstrument[];
}
