import { AdyenComponentEventState, CardState } from '../types';

export default function isCardState(param: AdyenComponentEventState): param is CardState {
    return (
        (typeof param === 'object' &&
            typeof (param as CardState).data.paymentMethod.encryptedSecurityCode === 'string') ||
        typeof (param as CardState).data.paymentMethod.encryptedExpiryMonth === 'string'
    );
}
