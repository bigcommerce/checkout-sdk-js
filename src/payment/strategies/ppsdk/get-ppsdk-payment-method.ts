import { CheckoutStore } from '../../../checkout';
import { isPPSDKPaymentMethod, PPSDKPaymentMethod } from '../../ppsdk-payment-method';

type GetPPSDKMethod = (store: CheckoutStore, methodId: string) => PPSDKPaymentMethod | undefined;

export const getPPSDKMethod: GetPPSDKMethod = (store, methodId) => {
    const paymentMethod = store.getState().paymentMethods.getPaymentMethod(methodId);

    if (!paymentMethod || !isPPSDKPaymentMethod(paymentMethod)) {
        return;
    }

    return paymentMethod;
};
