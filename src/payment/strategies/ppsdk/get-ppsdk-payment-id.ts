import { CheckoutStore } from '../../../checkout';

type GetPPSDKPaymentId = (store: CheckoutStore, methodId: string) => string | undefined;

export const getPPSDKPaymentId: GetPPSDKPaymentId = (store, methodId) => {
    const orderPayments = store.getState().order.getOrder()?.payments;
    const currentPayment = orderPayments?.find(({ providerId }) => providerId === methodId);

    return currentPayment?.paymentId;
};
