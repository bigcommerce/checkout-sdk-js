import PaymentMethodConfig from './payment-method-config';
import InitialisationStrategies from './ppsdk-initialisation-strategies';
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
    initializationStrategy?: InitialisationStrategies;
}
