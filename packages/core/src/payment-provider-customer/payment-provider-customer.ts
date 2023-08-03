import { Address } from '../address';
import { CardInstrument } from '../payment/instrument/instrument';

export type PaymentProviderCustomer = BraintreeAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authenticationState?: string;
    addresses?: Address[];
    instruments?: CardInstrument[];
}
