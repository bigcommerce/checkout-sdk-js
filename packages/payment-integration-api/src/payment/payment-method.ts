import PaymentMethodConfig from './payment-method-config';
import InitializationStrategy from './payment-method-initialization-strategy';

export default interface PaymentMethod<T = any> {
    id: string;
    config: PaymentMethodConfig;
    method: string;
    supportedCards: string[];
    type: string;
    clientToken?: string;
    gateway?: string;
    logoUrl?: string;
    nonce?: string;
    initializationData?: T;
    returnUrl?: string;
    initializationStrategy?: InitializationStrategy;
}
