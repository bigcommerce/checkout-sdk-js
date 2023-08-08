import { CustomerAddress } from '../customer';
import { CardInstrument } from '../payment/instrument/instrument';

export type PaymentProviderCustomer = BraintreeAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}
