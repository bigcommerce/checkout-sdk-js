import { AccountState, AdyenComponentEventState } from '../types';

export default function isAccountState(param: AdyenComponentEventState): param is AccountState {
    const bankSupported = ['ideal', 'sepadirectdebit', 'directEbanking', 'giropay'];

    return bankSupported.includes((param as AccountState).data.paymentMethod.type);
}
