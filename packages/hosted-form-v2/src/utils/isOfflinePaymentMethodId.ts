import { OfflinePaymentMethodIds } from '../payment';

export const isOfflinePaymentMethodId = (id: string): id is OfflinePaymentMethodIds => {
    return id in OfflinePaymentMethodIds;
};
