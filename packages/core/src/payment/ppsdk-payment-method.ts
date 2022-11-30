import PaymentMethod from './payment-method';
import PaymentStrategyType from './payment-strategy-type';

type PPSDKRequiredProperties = 'initializationStrategy';

export type PPSDKPaymentMethod = PaymentMethod & {
    type: PaymentStrategyType.PPSDK;
} & Required<Pick<PaymentMethod, PPSDKRequiredProperties>>;

export const isPPSDKPaymentMethod = (
    paymentMethod: PaymentMethod,
): paymentMethod is PPSDKPaymentMethod => {
    const { type, initializationStrategy } = paymentMethod;

    return type === PaymentStrategyType.PPSDK && typeof initializationStrategy?.type === 'string';
};
