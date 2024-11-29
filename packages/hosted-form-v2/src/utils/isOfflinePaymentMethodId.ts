import { OfflinePaymentMethodIds } from '../payment';

export const isOfflinePaymentMethodId = (id: string): id is OfflinePaymentMethodIds => {
    return Object.values(OfflinePaymentMethodIds).includes(id as OfflinePaymentMethodIds);
};
