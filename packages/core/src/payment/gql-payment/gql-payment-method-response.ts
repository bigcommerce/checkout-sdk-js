import GqlPaymentMethod from './gql-payment-method';

export interface GqlPaymentMethodResponse {
    data: {
        site: GqlPaymentMethod;
    };
}
