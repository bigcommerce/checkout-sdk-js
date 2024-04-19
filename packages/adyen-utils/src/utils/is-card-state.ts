import { AdyenComponentState, CardState } from '../types';

export default function isCardState(param: AdyenComponentState): param is CardState {
    return (
        (typeof param === 'object' &&
            typeof (param as CardState).data.paymentMethod.encryptedSecurityCode === 'string') ||
        typeof (param as CardState).data.paymentMethod.encryptedExpiryMonth === 'string'
    );
}
