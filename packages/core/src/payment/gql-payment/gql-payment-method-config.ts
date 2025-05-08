import { GqlPaymentMethodType } from './gql-payment-method-type';

const GqlPaymentMethodConfig: Record<string, GqlPaymentMethodType> = {
    paypalcommerce: GqlPaymentMethodType.PAYPALCOMMERCE,
    paypalcommercecredit: GqlPaymentMethodType.PAYPALCOMMERCECREDIT,
    braintree: GqlPaymentMethodType.BRAINTREE,
};

export default GqlPaymentMethodConfig;
