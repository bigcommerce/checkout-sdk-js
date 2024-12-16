import HeadlessPaymentMethod from './headless-payment-method';

export interface HeadlessPaymentMethodResponse<T = any> {
    data: {
        site: HeadlessPaymentMethod<T>;
    };
}
