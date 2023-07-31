import { AddressRequestBody } from '../address';
import { CardInstrument } from '../payment/instrument/instrument';

export type PaymentProviderCustomer = BraintreeAcceleratedCheckoutCustomer;

export interface BraintreeAcceleratedCheckoutCustomer {
    authorizationStatus?: string;
    addresses?: AddressRequestBody[];
    instruments?: CardInstrument[];
}
