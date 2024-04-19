import { AccountState, AdyenComponentState } from '../types';

export default function isAccountState(param: AdyenComponentState): param is AccountState {
    const bankSupported = ['ideal', 'sepadirectdebit', 'directEbanking', 'giropay'];

    return bankSupported.indexOf((param as AccountState).data.paymentMethod.type) !== -1;
}
