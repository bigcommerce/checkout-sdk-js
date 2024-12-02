import { OfflinePaymentMethods } from '../payment';

export const isOfflinePaymentMethodId = (id: string): id is OfflinePaymentMethods => {
    return Object.values(OfflinePaymentMethods).includes(id as OfflinePaymentMethods);
};
