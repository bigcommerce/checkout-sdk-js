import { HeadlessPaymentMethodType } from './headless-payment-method-type';

const HeadlessPaymentMethodConfig: Record<string, HeadlessPaymentMethodType> = {
    paypalcommerce: HeadlessPaymentMethodType.PAYPALCOMMERCE,
    paypalcommercecredit: HeadlessPaymentMethodType.PAYPALCOMMERCECREDIT,
};

export default HeadlessPaymentMethodConfig;
