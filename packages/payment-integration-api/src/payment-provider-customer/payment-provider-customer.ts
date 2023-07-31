import { AddressRequestBody } from '../address';
import { CardInstrument } from '../payment';

export type PaymentProviderCustomer = BraintreeAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authorizationStatus?: string;
    addresses?: AddressRequestBody[];
    instruments?: CardInstrument[];
}
