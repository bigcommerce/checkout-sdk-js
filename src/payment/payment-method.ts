import PaymentMethodConfig from './payment-method-config';
import InitializationStrategy from './payment-method-initialization-strategy';

export default interface PaymentMethod {
    id: string;
    config: PaymentMethodConfig;
    method: string;
    providesShippingAddress: boolean;
    supportedCards: string[];
    type: string;
    clientToken?: string;
    gateway?: string;
    logoUrl?: string;
    nonce?: string;
    initializationData?: any;
    returnUrl?: string;
    initializationStrategy?: InitializationStrategy;
}
