export default function paypalCommerceFundingKeyResolver(methodId: string, gatewayId?: string) {
    if (methodId === 'paypalcommerce') {
        return 'PAYPAL';
    }

    if (methodId === 'paypalcommercecredit') {
        return 'PAYLATER';
    }

    if (gatewayId === 'paypalcommercealternativemethods') {
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
