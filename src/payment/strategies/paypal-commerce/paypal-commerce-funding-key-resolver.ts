import PaymentStrategyType from '../../payment-strategy-type';

import { PaypalCommerceSDKFunding } from './paypal-commerce-sdk';

export default class PaypalCommerceFundingKeyResolver {
    resolve(methodId: string, gatewayId?: string): keyof PaypalCommerceSDKFunding {
        if (methodId === PaymentStrategyType.PAYPAL_COMMERCE) {
            return 'PAYPAL';
        }

        if (methodId === PaymentStrategyType.PAYPAL_COMMERCE_CREDIT) {
            return 'PAYLATER';
        }

        if (gatewayId === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS) {
            switch (methodId) {
                case 'bancontact':
                    return 'BANCONTACT';
                case 'giropay':
                    return 'GIROPAY';
                case 'przelewy24':
                    return 'P24';
                case 'eps':
                    return 'EPS';
                case 'ideal':
                    return 'IDEAL';
                case 'mybank':
                    return 'MYBANK';
                case 'sofort':
                    return 'SOFORT';
                case 'blik':
                    return 'BLIK';
            }
        }

        throw new Error('Unable to resolve funding key');
    }
}
