import { Checkout } from '../../checkout';

export default interface HeadlessCheckoutResponse {
    checkout?: {
        entityId: string;
    };
}

export type HeadlessCheckout = Omit<Checkout, 'customer' | 'cart'>;
