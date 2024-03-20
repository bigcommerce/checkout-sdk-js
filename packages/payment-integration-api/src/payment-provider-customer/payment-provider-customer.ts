import { CustomerAddress } from '../customer';
import { CardInstrument } from '../payment';

export type PaymentProviderCustomer = PayPalConnectCustomer | StripeAcceleratedCheckoutCustomer;

export interface PayPalConnectCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}

export interface StripeAcceleratedCheckoutCustomer {
    stripeLinkAuthenticationState?: boolean;
}

export interface BraintreeFastlaneCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}
