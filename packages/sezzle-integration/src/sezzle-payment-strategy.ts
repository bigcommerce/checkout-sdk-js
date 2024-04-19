import { ExternalPaymentStrategy } from '@bigcommerce/checkout-sdk/external-integration';

export default class SezzlePaymentStrategy extends ExternalPaymentStrategy {
    protected redirectUrl(url: string): void {
        window.location.replace(url);
    }
}
