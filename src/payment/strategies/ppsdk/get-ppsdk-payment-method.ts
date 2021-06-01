import { CheckoutStore } from '../../../checkout';
import { PaymentInitializeOptions } from '../../payment-request-options';
import { isPPSDKPaymentMethod, PPSDKPaymentMethod } from '../../ppsdk-payment-method';

type GetPPSDKMethod = (store: CheckoutStore, options?: PaymentInitializeOptions) => PPSDKPaymentMethod | undefined;

export const getPPSDKMethod: GetPPSDKMethod = (store, options) => {
    if (!options) {
        return;
    }

    const { methodId, gatewayId } = options;
    const paymentMethod = store.getState().paymentMethods.getPaymentMethod(methodId, gatewayId);

    if (!paymentMethod || !isPPSDKPaymentMethod(paymentMethod)) {
        return;
    }

    return paymentMethod;
};
