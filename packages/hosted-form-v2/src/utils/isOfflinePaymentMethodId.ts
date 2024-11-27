import { OfflinePaymentMethodId } from '../payment';

export const isOfflinePaymentMethodId = (id: string): id is OfflinePaymentMethodId => {
    return Object.values(OfflinePaymentMethodId).includes(id as OfflinePaymentMethodId);
};
