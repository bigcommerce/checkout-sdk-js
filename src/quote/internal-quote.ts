import { InternalAddress } from '../address';

export default interface InternalQuote {
    orderComment: string;
    shippingOption?: string;
    billingAddress: Partial<InternalAddress>;
    shippingAddress: Partial<InternalAddress>;
}
