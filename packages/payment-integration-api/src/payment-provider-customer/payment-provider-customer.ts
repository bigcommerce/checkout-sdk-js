import { Address } from '../address';
import { CardInstrument } from '../payment';

export type PaymentProviderCustomer = BraintreeAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authenticationState?: string;
    addresses?: Address[];
    instruments?: CardInstrument[];
}
