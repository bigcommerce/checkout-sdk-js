import { PaymentProviderAuthentication } from './payment-provider-authentication';

export default interface PaymentProviderAuthenticationState {
    data: PaymentProviderAuthentication;
}

export const DEFAULT_STATE = {
    data: {
        isAuthenticated: false,
    },
};
