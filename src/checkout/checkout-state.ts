import { Omit } from '../common/types';

import Checkout from './checkout';

export default interface CheckoutState {
    data?: CheckoutDataState;
    errors: CheckoutErrorsState;
    statuses: CheckoutStatusesState;
}

export type CheckoutDataState = Omit<Checkout, 'billingAddress' | 'cart' | 'consignments' | 'coupons' | 'giftCertificates'>;

export interface CheckoutErrorsState {
    loadError?: Error;
    updateError?: Error;
}

export interface CheckoutStatusesState {
    isLoading?: boolean;
    isUpdating?: boolean;
}

export const DEFAULT_STATE: CheckoutState = {
    errors: {},
    statuses: {},
};
