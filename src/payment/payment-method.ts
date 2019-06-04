import PaymentMethodConfig from './payment-method-config';

export default interface PaymentMethod {
    id: string;
    config: PaymentMethodConfig;
    method: string;
    supportedCards: string[];
    type: string;
    clientToken?: string;
    gateway?: string;
    logoUrl?: string;
    nonce?: string;
    initializationData?: any;
    returnUrl?: string;
}
